import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  reorderProjects,
  updateProject,
  uploadImage,
} from '../controllers/projects.controller.js';
import { optionalAuth, requireAuth, requireAuthForDrafts } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { projectQuerySchema, projectSchema, reorderSchema } from '../validators/schemas.js';

export const projectRoutes = Router();

// --- Public -----------------------------------------------------------------
// optionalAuth lets signed-in staff see unpublished projects. Asking for drafts
// explicitly (`includeUnpublished=true`) is strict: a missing or expired token is
// a 401 — never a silently shorter list — so the admin app refreshes or signs out.
projectRoutes.get(
  '/',
  optionalAuth,
  validate(projectQuerySchema, 'query'),
  requireAuthForDrafts,
  listProjects,
);

// --- Admin ------------------------------------------------------------------
// Fixed paths are declared before '/:id' so "upload" and "reorder" are not read as IDs.
projectRoutes.post('/upload', requireAuth, uploadSingleImage, uploadImage);
projectRoutes.put('/reorder', requireAuth, validate(reorderSchema), reorderProjects);
projectRoutes.post('/', requireAuth, validate(projectSchema), createProject);

projectRoutes.get('/:id', optionalAuth, validate(projectQuerySchema, 'query'), requireAuthForDrafts, getProject);
projectRoutes.put('/:id', requireAuth, validate(projectSchema), updateProject);
projectRoutes.delete('/:id', requireAuth, deleteProject);
