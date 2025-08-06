import * as dotenv from 'dotenv';
dotenv.config();

import * as winston from 'winston';
import { TelegramTransport } from './transport/telegram/telegram.transport';
import { LoggerConfig } from 'src/common/logger/config/logger.config';
import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';


const consoleTransport = new winston.transports.Console({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, context = 'NestApplication', stack }) => {
      const ts = chalk.cyanBright(`[${timestamp}]`);
      const lvl = level;
      const ctx = chalk.cyanBright(`[${context}]`);
      const msg = stack ? `${message}\n${chalk.red(stack)}` : message;

      return `${ts} ${lvl} ${ctx} ${msg}`;
    }),
  ),
});

const telegramTransport = new TelegramTransport({
  level: LoggerConfig.telegram.minLevel,
  botToken: LoggerConfig.telegram.botToken,
  chatId: LoggerConfig.telegram.chatId,
});

// const fileTransports: winston.transport[] =
//   [
//     new winston.transports.File({
//       filename: 'logs/error.log',
//       level: 'error',
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json(),
//       ),
//     })
//   ];  

export const winstonLogger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  transports: [consoleTransport, telegramTransport],
});
