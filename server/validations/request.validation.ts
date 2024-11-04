import { z } from 'zod';

export const getRequestSchema = z.object({
	filterTags: z
		.array(z.string())
		.min(1, 'filterTags must be a non-empty array of strings'),
});

export const refreshRequestSchema = z.object({
	forceRefresh: z.boolean(),
});
