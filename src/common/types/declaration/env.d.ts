namespace NodeJS {
    interface ProcessEnv {

        //Applicatio
        PORT: number
        NODE_ENV: string
        FRONTEND_URL: string
        
        //Database
        DB_PORT: number
        DB_NAME: string
        DB_USERNAME: string;
        DB_PASSWORD: string;
        DB_HOST: string;

        //secrets
        ACCESS_TOKEN_SECRET: string
        REFRESH_TOKEN_SECRET: string

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
        S3_FILE_PATH_URL: string


        // zarinpal
        ZARINPAL_GATEWAY_URL: string
        ZARINPAL_REQUEST_URL: string
        ZARINPAL_VERIFY_URL: string
        ZARINPAL_MERCHANT_ID: string
        ZARINPAL_CALLBACK_URL: string
    }
}