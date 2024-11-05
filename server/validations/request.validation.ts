import { z } from 'zod';

const paginationSchema = z.object({
	limit: z.number(),
	offset: z.number(),
});

export const getRequestSchema = paginationSchema.extend({
	tags: z
		.array(z.string())
		.min(1, 'filterTags must be a non-empty array of strings'),
});

export const refreshRequestSchema = z.object({
	refresh: z.boolean(),
});
