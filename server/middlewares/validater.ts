import {
	getRequestSchema,
	refreshRequestSchema,
} from '../validations/request.validation';

import { zValidator } from '@hono/zod-validator';

export const validateGetRequest = zValidator('json', getRequestSchema);

export const validateRefreshRequest = zValidator('json', refreshRequestSchema);
