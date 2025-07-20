import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';

@Injectable()
export class StorageService {


    private s3Client = new S3Client({
        region: "default",
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        }
    })

    async uploadSingleFile(
        filename: string,
        file: Buffer,
        folder: string
    ): Promise<void> {
        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Body: file,
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${folder}/${filename}`
                })
            )
        } catch (error) {
            if (error?.hostname?.includes('liara.space')) {
                throw new HttpException(
                    'Error connecting to Liara. Please try again later.',
                    HttpStatus.SERVICE_UNAVAILABLE
                );
            }


            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async uploadMultiFile(
        files: Express.Multer.File[],
        folder: string
    ): Promise<void> {
        try {
            const storageQueries = files.map(
                file => {
                    return this.s3Client.send(
                        new PutObjectCommand({
                            Body: file.buffer,
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: `${folder}/${file.filename}`
                        })
                    )
                }
            )
            await Promise.all(storageQueries);
        } catch (error) {
            if (error?.hostname?.includes('liara.space')) {
                throw new HttpException(
                    'Error connecting to Liara. Please try again later.',
                    HttpStatus.SERVICE_UNAVAILABLE
                );
            }


            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async deleteFile(
        filename: string,
        folder: string
    ): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${folder}/${filename}`
                })
            )
        } catch (error) {
            if (error?.hostname?.includes('liara.space')) {
                throw new HttpException(
                    'Error connecting to Liara. Please try again later.',
                    HttpStatus.SERVICE_UNAVAILABLE
                );
            }


            if (error instanceof HttpException) {
                console.log("i m here");

                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    getFileLink(filename: string, folder: string): string {
        const basePath = process.env.S3_FILE_PATH_URL;
        return `${basePath}/${folder}/${filename}`;
    }

}
