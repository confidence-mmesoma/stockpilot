import { z } from 'zod';

export const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or less'); // bcrypt only uses the first 72

export function formatIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
}