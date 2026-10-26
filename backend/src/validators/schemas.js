import { z } from 'zod';

/**
 * Keep in sync with `PROJECT_CATEGORIES` in src/app/models/project.model.ts —
 * the values double as i18n keys on the public projects page.
 */
export const PROJECT_CATEGORIES = [
  'Administrative',
  'Commercial',
  'Interior Design',
  'Entertainment',
  'Landscape',
  'Residential',
];

// --- Auth -------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(12, 'Use at least 12 characters').max(200),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'The new password must differ from the current one',
    path: ['newPassword'],
  });

// --- Projects ---------------------------------------------------------------

const text = z.object({ en: z.string().max(4000), ar: z.string().max(4000) });

/**
 * Image reference: empty (not uploaded yet), an http(s) URL, an upload path
 * (`/uploads/...`) or a bundled asset (`assets/...`). Anything else — including
 * `javascript:` URLs and free text such as "PASTE IMAGE LINK HERE" — is rejected.
 */
const image = z
  .string()
  .max(2048)
  .regex(/^(https?:\/\/\S+|\/uploads\/\S+|assets\/\S+)?$/, 'Use an uploaded image or an http(s) URL');

/** `showcase` toggles an optional section on the project page; true when omitted. */
const showcase = z.boolean().default(true);

const overviewBlock = z.object({
  showcase,
  number: z.string().max(10),
  title: text,
  quote: text,
  paragraph1: text,
  paragraph2: text,
});

export const projectSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only'),
    category: z.enum(PROJECT_CATEGORIES),
    isPublished: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(100000).optional(),
    card: z.object({
      image,
      title: text,
      location: text,
      area: text,
      size: z.enum(['large', 'small', 'full']),
    }),
    hero: z.object({
      eyebrow: text,
      title: text,
      subtitle: text,
      image,
      details: z.object({
        location: text,
        totalArea: text,
        year: z.string().max(40),
        scope: text,
      }),
    }),
    overview: z.object({ challenge: overviewBlock, concept: overviewBlock }),
    designProcess: z.object({ showcase, label: text, images: z.array(image).max(60) }),
    visualJourney: z.object({ showcase, label: text, images: z.array(image).max(60) }),
    solution: overviewBlock,
    spatialExperience: z.object({ showcase, image, title: text, text }),
  })
  // The grid card and the top of the project page always show these two images,
  // so a project cannot go live without them. Drafts may leave them empty.
  .superRefine((project, ctx) => {
    if (!project.isPublished) return;
    if (!project.card.image) {
      ctx.addIssue({ code: 'custom', path: ['card', 'image'], message: 'Add a card image before publishing' });
    }
    if (!project.hero.image) {
      ctx.addIssue({ code: 'custom', path: ['hero', 'image'], message: 'Add a hero image before publishing' });
    }
  });

export const projectQuerySchema = z.object({
  category: z.enum(PROJECT_CATEGORIES).optional(),
  includeUnpublished: z.enum(['true', 'false']).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1).max(120)).min(1).max(500),
});
