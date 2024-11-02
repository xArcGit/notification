import { httpStatus } from '@utils/http-status';
import { requestSchema } from '../validations/request.validation';
import { sendResponse } from '../utils/response';
import { zValidator } from '@hono/zod-validator';

export const validateRequest = zValidator(
	'json',
	requestSchema,
	(result, c) => {
		if (!result.success) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'Invalid request data',
			);
		}
	},
);
