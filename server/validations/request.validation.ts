import { z } from 'zod';

export const requestSchema = z.object({
	tags: z.array(z.string()),
});
