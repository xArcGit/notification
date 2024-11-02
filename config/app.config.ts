import { env } from './env';

export const config = {
	runner: {
		env: env.ENV,
		port: {
			server: env.SERVER_PORT,
			client: env.CLIENT_PORT,
		},
	},
	database: {
		path: env.DATABASE_PATH,
		name: env.DATABASE_NAME,
	},
	log: {
		level: env.LOG_LEVEL,
		color: env.LOG_USE_COLORS,
	},
};
