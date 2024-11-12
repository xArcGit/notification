import {
	paginationSchema,
	searchRequestSchema,
	refreshRequestSchema,
} from '../validations/request.validation';

import { zValidator } from '@hono/zod-validator';

export const validateGetRequest = zValidator('json', paginationSchema);
export const validateSearchRequest = zValidator('json', searchRequestSchema);
export const validateRefreshRequest = zValidator('json', refreshRequestSchema);
