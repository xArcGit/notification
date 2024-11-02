import { config } from '@config/app.config';
import pino from 'pino';

export const logger = pino({
	level: config.log.level,
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: config.log.color,
			translateTime: 'SYS:standard',
		},
	},
});
