import { httpStatus, httpStatusMessages } from '@utils/http-status';

import ApiError from './utils/api-error';
import { Hono } from 'hono';
import { logger as customLogger } from '@utils/logger';
import { errorHandler } from './middlewares/error-handler';
import { logger } from 'hono/logger';
import { route } from './routes';
import { sentry } from '@hono/sentry';

const app = new Hono();
app.use('*', sentry());

app.use(
	'*',
	logger((message, ...rest) => customLogger.info(message, ...rest)),
);

app.route('/api', route);

app.notFound(() => {
	throw new ApiError(
		httpStatus.NOT_FOUND,
		httpStatusMessages[httpStatus.NOT_FOUND],
	);
});

app.onError(errorHandler);

export default app;
export type AppType = typeof app;
