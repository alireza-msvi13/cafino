namespace NodeJS {
  interface ProcessEnv {
    //App
    PORT: number;
    NODE_ENV: string;
    FRONTEND_URL: string;

    //Database
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;

    //Secret
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;

    //Sms
    SMS_API_KEY: string;
    SMS_PATTERN_CODE: string;
    SMS_FROM_NUM: string;
    SMS_BASE_URL: string;

    // Aws
    S3_SECRET_KEY: string;
    S3_ACCESS_KEY: string;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT: string;
    S3_FILE_PATH_URL: string;

    // Zarinpal
    ZARINPAL_GATEWAY_URL: string;
    ZARINPAL_REQUEST_URL: string;
    ZARINPAL_VERIFY_URL: string;
    ZARINPAL_MERCHANT_ID: string;
    ZARINPAL_CALLBACK_URL: string;

    // Telegram
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;

    // SMTP
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
  }
}
