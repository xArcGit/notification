import { z } from 'zod';

<<<<<<< HEAD
export const getRequestSchema = z.object({
	filterTags: z
		.array(z.string())
		.min(1, 'filterTags must be a non-empty array of strings'),
});

export const refreshRequestSchema = z.object({
	forceRefresh: z.boolean(),
||||||| 88693b6
export const requestSchema = z.object({
	tags: z.array(z.string()),
=======
export const getRequestSchema = z.object({
	filterTags: z.array(z.string()),
});

export const refreshRequestSchema = z.object({
	forceRefresh: z.boolean(),
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
});
