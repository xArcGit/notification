import {
	validateGetRequest,
	validateRefreshRequest,
} from '../middlewares/validater';

import { Hono } from 'hono';
import db from '../config/databases';
import { httpStatus } from '@utils/http-status';
import { logger } from '@utils/logger';
import { restrictRunInterval } from '../middlewares/refresh';
import { sendResponse } from '../utils/response';
import { updateScheduleNotices } from '../api/ipu';

interface Notification {
	id: number;
	title: string;
	description: string;
	view_link: string;
	download_link: string;
	tags: string;
}

interface FetchNotificationsResult {
	status: number;
	data: Notification[] | null;
	message?: string;
}

const fetchNotifications = async (
	queryText: string,
	params: any[],
): Promise<FetchNotificationsResult> => {
	try {
		const statement = db.query(queryText);
		const rows = statement.all(...params) as Notification[]; // Use .all() to fetch all results

		return { status: httpStatus.OK, data: rows };
	} catch (error) {
		logger.error('Database error:', error);
		return {
			status: httpStatus.INTERNAL_SERVER_ERROR,
			data: null,
			message: 'Database error occurred',
		};
	}
};

const route = new Hono();

// GET /get route to retrieve notifications based on tags
route.get('/get', validateGetRequest, async c => {
	try {
		const { filterTags } = c.req.valid('json') as {
			filterTags: string[];
		};
		const tagsString = `%${filterTags.join(',')}%`;

		const queryText = `
		SELECT * FROM notifications
		WHERE tags LIKE ?;
	`;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsString,
		]);
		return sendResponse(c, status, data, message);
	} catch (error) {
		logger.error('Error processing /get request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Internal Server Error',
		);
	}
});

// GET /search route to search notifications by tags and query
route.get('/search', validateGetRequest, async c => {
	try {
		const { filterTags } = c.req.valid('json') as {
			filterTags: string[];
		};
		const { query } = c.req.query() as { query: string };
		const tagsString = `%${filterTags.join(',')}%`;
		const searchQuery = `%${query}%`;

		const queryText = `
      SELECT * FROM notifications
      WHERE
        tags LIKE ? AND
        (title LIKE ? OR description LIKE ?);
    `;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsString,
			searchQuery,
			searchQuery,
		]);
		return sendResponse(c, status, data, message);
	} catch (error) {
		logger.error('Error processing /search request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Internal Server Error',
		);
	}
});

// POST /refresh route to trigger data refresh
route.post('/refresh', restrictRunInterval, validateRefreshRequest, async c => {
	try {
		const { forceRefresh } = c.req.valid('json') as { forceRefresh: boolean };
		if (forceRefresh) {
			await updateScheduleNotices();
			return sendResponse(
				c,
				httpStatus.OK,
				null,
				'Refresh completed successfully',
			);
		}
		return sendResponse(
			c,
			httpStatus.BAD_REQUEST,
			null,
			'Refresh not triggered. Set forceRefresh to true to proceed.',
		);
	} catch (error) {
		logger.error('Error processing /refresh request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Refresh failed',
		);
	}
});

export { route };
