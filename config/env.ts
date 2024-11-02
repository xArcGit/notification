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
	DATABASE_PATH: z.string(),
	DATABASE_NAME: z.string(),
	LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.INFO),
	LOG_USE_COLORS: z.preprocess(
		val => val === 'true' || val === true,
		z.boolean().default(true),
	),
});

export const env = envSchema.parse(Bun.env);
