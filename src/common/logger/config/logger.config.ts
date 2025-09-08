export const LoggerConfig = {
  telegram: {
    enabled: process.env.NODE_ENV === 'production',
    minLevel: 'error',
    onlyStatusAbove: 499,
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    criticalKeywords: [
      'ECONNREFUSED',
      'UnhandledPromiseRejection',
      'MongoError',
      'QueryFailedError',
      'axios',
    ],
  },
};
