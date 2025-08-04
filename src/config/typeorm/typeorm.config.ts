import {TypeOrmModuleOptions} from "@nestjs/typeorm";

export function TypeOrmConfig(): TypeOrmModuleOptions {
  const {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME} = process.env;  
  return {
    type: "postgres",
    host: DB_HOST,
    port: +DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    autoLoadEntities: true,
    synchronize: true,
    ssl: process.env.NODE_ENV === "production",
    entities: [
      "dist/**/**/**/*.entity{.ts,.js}",
      "dist/**/**/*.entity{.ts,.js}"
    ]
  };  
}