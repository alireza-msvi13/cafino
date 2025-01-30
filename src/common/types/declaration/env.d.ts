namespace NodeJS {
    interface ProcessEnv {
        //Application
        PORT: number
        NODE_ENV: string
        //Database
        DB_PORT: number
        DB_NAME: string
        DB_USERNAME: string;
        DB_PASSWORD: string;
        DB_HOST: string;
        //secrets
        COOKIE_SECRET: string
        OTP_TOKEN_SECRET: string
        ACCESS_TOKEN_SECRET: string
        EMAIL_TOKEN_SECRET: string
        REFRESH_TOKEN_SECRET: string
        PHONE_TOKEN_SECRET: string
        PASSWORD_TOKEN_SECRET: string
        //Sms
        SMS_USER: string
        SMS_PASS: string
        SMS_PATTERN_CODE: string
        SMS_FROM_NUM: string
        SMS_BASE_URL: string
        //google
        GOOGLE_CLIENT_ID: string;
        GOOGLE_SECRET_ID: string;

        // Email
        EMAIL: string;
        EMAIL_PASS: string;

        // aws
        S3_SECRET_KEY: string
        S3_ACCESS_KEY: string
        S3_BUCKET_NAME: string
        S3_ENDPOINT: string
    }
}