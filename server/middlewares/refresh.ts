import type { Context, Next } from 'hono';

import { httpStatus } from '@utils/http-status';
import { sendResponse } from './../utils/response';

let lastRunTimestamp: number | null = null;

export const restrictRunInterval = async (c: Context, next: Next) => {
	const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;
	const currentTime = Date.now();

	if (lastRunTimestamp && currentTime - lastRunTimestamp < SIX_HOURS_IN_MS) {
		return sendResponse(
			c,
			httpStatus.TOO_MANY_REQUESTS,
			null,
			'This route can only be accessed once every 6 hours.',
		);
	}

	lastRunTimestamp = currentTime;
	await next();
};
