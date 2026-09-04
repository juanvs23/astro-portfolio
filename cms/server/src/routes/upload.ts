import { Hono } from 'hono';
import { put } from '@vercel/blob';
import type { AppConfig } from '../config.js';
import { requireAuth, requireRole, type Variables } from '../middleware/auth.js';
import { HttpError, badRequest } from '../errors.js';

type UploadEnv = { Variables: Variables };

/**
 * Admin image upload mounted at `/api/v1/admin/upload` (admin-only). Uploads
 * the multipart `file` to Vercel Blob and returns the public `{ url }`.
 * If `BLOB_READ_WRITE_TOKEN` is not configured the route answers 503 so the
 * rest of the CMS keeps working (no hard dependency on Blob).
 */
export function uploadRoutes(cfg: AppConfig): Hono<UploadEnv> {
  const upload = new Hono<UploadEnv>();
  upload.use('*', requireAuth(cfg.jwtSecret));

  upload.post('/', requireRole('admin'), async (c) => {
    if (!cfg.blobToken) {
      throw new HttpError(
        503,
        'Blob storage is not configured — set BLOB_READ_WRITE_TOKEN to enable uploads',
        'blob_not_configured',
      );
    }

    const form = await c.req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      throw badRequest('A multipart "file" field is required');
    }

    const pathname = `cms/${Date.now()}-${file.name}`;
    const blob = await put(pathname, file, {
      access: 'public',
      token: cfg.blobToken,
    });

    return c.json({ url: blob.url }, 200);
  });

  return upload;
}