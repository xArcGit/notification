import { z } from 'zod';

export const getRequestSchema = z.object({
	filterTags: z.array(z.string()),
});

export const refreshRequestSchema = z.object({
	forceRefresh: z.boolean(),
});
