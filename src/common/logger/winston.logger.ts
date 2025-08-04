import * as dotenv from 'dotenv';
dotenv.config();

import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { TelegramTransport } from './telegram.transport';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      nestWinstonModuleUtilities.format.nestLike('NestApp', {
        prettyPrint: true,
      }),
    ),
  }),
];

if (process.env.NODE_ENV === 'development') {
  transports.push(
    new TelegramTransport({
      level: 'error',
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    }),
  );
}

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
});
