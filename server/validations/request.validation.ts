import { z } from 'zod';

export const paginationSchema = z.object({
	tags: z.array(z.string()).min(1),
	limit: z.number(),
	offset: z.number(),
});

export const searchRequestSchema = paginationSchema.extend({
	search: z.string(),
});

export const refreshRequestSchema = z.object({
	refresh: z.boolean(),
});
