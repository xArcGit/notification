import { z } from 'zod';

enum LogLevel {
	TRACE = 'trace',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	FATAL = 'fatal',
}

const envSchema = z.object({
	ENV: z.enum(['production', 'development']).default('production'),
	SERVER_PORT: z.preprocess(val => Number(val), z.number().default(3001)),
	CLIENT_PORT: z.preprocess(val => Number(val), z.number().default(3000)),
	DATABASE_NAME: z.string().default('db.sqlite'),
	LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.INFO),
	LOG_USE_COLOR: z.preprocess(
		val => val === 'true' || val === true,
		z.boolean().default(true),
	),
});

export const env = envSchema.parse(Bun.env);
