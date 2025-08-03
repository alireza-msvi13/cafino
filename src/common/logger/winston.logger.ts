import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        nestWinstonModuleUtilities.format.nestLike('NestApp', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
