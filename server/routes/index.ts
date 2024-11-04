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
<<<<<<< HEAD
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

// Utility function to fetch notifications from the database
const fetchNotifications = async (
	queryText: string,
	params: any[],
): Promise<FetchNotificationsResult> => {
	try {
		const statement = db.prepare(queryText);
		const rows = statement.all(...params) as Notification[]; // Using `prepare` and `all` for proper query execution

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
||||||| 88693b6
import { validateRequest } from '../middlewares/validater';
=======
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
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c

const route = new Hono();

<<<<<<< HEAD
// GET /get route to retrieve notifications based on tags
route.post('/get', validateGetRequest, async c => {
||||||| 88693b6
route.get('/get', validateRequest, async c => {
	const { tags } = c.req.valid('json');
=======
// GET /get route to retrieve notifications based on tags
route.get('/get', validateGetRequest, async c => {
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
	try {
<<<<<<< HEAD
		const { filterTags } = c.req.valid('json') as { filterTags: string };
||||||| 88693b6
		const tagsString = `%${tags.join(',')}%`;
		const queryText = `
			SELECT * FROM notifications
			WHERE tags LIKE ?;
		`;
		const rows = db.query(queryText).all(tagsString);
=======
		const { filterTags } = c.req.valid('json') as {
			filterTags: string[];
		};
		const tagsString = `%${filterTags.join(',')}%`;
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c

<<<<<<< HEAD
		if (!filterTags || filterTags.length === 0) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'filterTags must be a non-empty array of strings',
			);
		}

		const tagsString = `%${filterTags.join(',')}%`;
		const queryText = `
      SELECT * FROM notifications
      WHERE tags LIKE ?;
    `;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsString,
		]);
		return sendResponse(c, status, data, message);
||||||| 88693b6
		return sendResponse(c, httpStatus.OK, rows);
=======
		const queryText = `
		SELECT * FROM notifications
		WHERE tags LIKE ?;
	`;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsString,
		]);
		return sendResponse(c, status, data, message);
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
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

<<<<<<< HEAD
// GET /search route to search notifications by tags and query
route.post('/search', validateGetRequest, async c => {
||||||| 88693b6
route.get('/search', validateRequest, async c => {
	const { tags } = c.req.valid('json');
	const { query } = c.req.query();
=======
// GET /search route to search notifications by tags and query
route.get('/search', validateGetRequest, async c => {
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
	try {
<<<<<<< HEAD
		const { filterTags } = c.req.valid('json') as { filterTags: string[] };
		const query = c.req.query('query') || ''; // Fetching query parameter

		const tagsString = `%${filterTags.join(',')}%`;
||||||| 88693b6
		const tagsString = `%${tags.join(',')}%`;
=======
		const { filterTags } = c.req.valid('json') as {
			filterTags: string[];
		};
		const { query } = c.req.query() as { query: string };
		const tagsString = `%${filterTags.join(',')}%`;
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
		const searchQuery = `%${query}%`;

		const queryText = `
<<<<<<< HEAD
			SELECT * FROM notifications
			WHERE tags LIKE ? AND (title LIKE ? OR description LIKE ?);
		`;
||||||| 88693b6
			SELECT * FROM notifications
			WHERE
				tags LIKE ? AND
				(title LIKE ? OR description LIKE ?);
		`;
		const rows = db.query(queryText).all(tagsString, searchQuery, searchQuery);
=======
      SELECT * FROM notifications
      WHERE
        tags LIKE ? AND
        (title LIKE ? OR description LIKE ?);
    `;
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c

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
<<<<<<< HEAD
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

||||||| 88693b6
		scrapeScheduleNotices();
=======
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
>>>>>>> 54b1bca46d85f331342f3372c6d2034348b3fe8c
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
