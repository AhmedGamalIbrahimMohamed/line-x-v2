import { prisma } from '../lib/prisma.js';
import { processImage } from '../lib/image-processor.js';
import { storage, uploadKeysIn } from '../lib/storage/index.js';
import { ApiError, asyncHandler } from '../utils/errors.js';

const ORDER_BY = [{ sortOrder: 'asc' }, { createdAt: 'asc' }];

/** Flattens a row back into the `Project` shape the Angular site renders. */
const toDto = (row) => ({
  id: row.id,
  category: row.category,
  isPublished: row.isPublished,
  sortOrder: row.sortOrder,
  ...row.data,
});

/** Splits a validated payload into real columns and the JSON document. */
function toColumns({ id, category, isPublished, sortOrder, ...data }) {
  return { id, category, isPublished, sortOrder, data };
}

/**
 * Deletes uploaded files that `before` referenced but no project references any
 * more. Runs after the database write, so a failure here only leaves an orphan
 * behind — it never loses data.
 */
async function removeOrphanedUploads(before, after = null) {
  const afterKeys = uploadKeysIn(after);
  const candidates = [...uploadKeysIn(before)].filter((key) => !afterKeys.has(key));
  if (!candidates.length) return;

  const stillUsed = new Set();
  for (const row of await prisma.project.findMany({ select: { data: true } })) {
    for (const key of uploadKeysIn(row.data)) stillUsed.add(key);
  }

  await Promise.all(candidates.filter((key) => !stillUsed.has(key)).map((key) => storage.delete(key).catch(() => {})));
}

/** GET /api/projects — published only, unless a signed-in admin passes includeUnpublished=true. */
export const listProjects = asyncHandler(async (req, res) => {
  const { category, includeUnpublished } = req.validatedQuery;
  const showDrafts = includeUnpublished === 'true' && Boolean(req.user);

  const rows = await prisma.project.findMany({
    where: {
      ...(showDrafts ? {} : { isPublished: true }),
      ...(category ? { category } : {}),
    },
    orderBy: ORDER_BY,
  });

  res.json({ success: true, data: rows.map(toDto) });
});

/** GET /api/projects/:id */
export const getProject = asyncHandler(async (req, res) => {
  const row = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!row || (!row.isPublished && !req.user)) throw ApiError.notFound('Project not found');
  res.json({ success: true, data: toDto(row) });
});

/** POST /api/projects */
export const createProject = asyncHandler(async (req, res) => {
  const columns = toColumns(req.body);

  if (await prisma.project.findUnique({ where: { id: columns.id }, select: { id: true } })) {
    throw ApiError.conflict('A project with this ID already exists');
  }

  if (columns.sortOrder === undefined) {
    const last = await prisma.project.aggregate({ _max: { sortOrder: true } });
    columns.sortOrder = (last._max.sortOrder ?? -1) + 1;
  }

  const row = await prisma.project.create({ data: columns });
  res.status(201).json({ success: true, data: toDto(row) });
});

/** PUT /api/projects/:id — the slug is immutable; the body id must match the URL. */
export const updateProject = asyncHandler(async (req, res) => {
  if (req.body.id !== req.params.id) throw ApiError.badRequest('The project ID cannot be changed');

  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Project not found');

  const { id: _id, sortOrder, ...columns } = toColumns(req.body);
  const row = await prisma.project.update({
    where: { id: req.params.id },
    data: { ...columns, ...(sortOrder === undefined ? {} : { sortOrder }) },
  });

  await removeOrphanedUploads(existing.data, row.data);
  res.json({ success: true, data: toDto(row) });
});

/** PUT /api/projects/reorder — `ids` in the desired display order. */
export const reorderProjects = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (new Set(ids).size !== ids.length) throw ApiError.badRequest('Project IDs must be unique');

  const known = await prisma.project.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (known.length !== ids.length) throw ApiError.badRequest('One or more projects do not exist');

  await prisma.$transaction(ids.map((id, index) => prisma.project.update({ where: { id }, data: { sortOrder: index } })));
  res.json({ success: true, data: { message: 'Order saved' } });
});

/** DELETE /api/projects/:id */
export const deleteProject = asyncHandler(async (req, res) => {
  const removed = await prisma.project.delete({ where: { id: req.params.id } });
  await removeOrphanedUploads(removed.data);
  res.json({ success: true, data: { message: 'Project deleted' } });
});

/** POST /api/projects/upload — one image; returns the path to put in the project JSON. */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach an image in the "image" field');
  const { url } = await processImage(req.file, 'projects');
  res.status(201).json({ success: true, data: { url } });
});
