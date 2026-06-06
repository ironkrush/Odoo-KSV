import { ZodError } from 'zod';

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle SQLite constraint violations or Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database Error',
      message: err.message,
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
  });
};
