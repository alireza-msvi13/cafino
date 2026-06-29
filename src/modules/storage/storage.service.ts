// * AWS S3

// import {
//   DeleteObjectCommand,
//   PutObjectCommand,
//   S3Client,
// } from '@aws-sdk/client-s3';
// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   ServiceUnavailableException,
// } from '@nestjs/common';
// import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';

// @Injectable()
// export class StorageService {
//   private s3Client = new S3Client({
//     region: 'default',
//     endpoint: process.env.S3_ENDPOINT,
//     credentials: {
//       accessKeyId: process.env.S3_ACCESS_KEY,
//       secretAccessKey: process.env.S3_SECRET_KEY,
//     },
//   });

//   private handleError(error: any): never {
//     if (error?.hostname?.includes('liara.space')) {
//       throw new ServiceUnavailableException(
//         'Error connecting to Liara. Please try again later.',
//       );
//     }
//     if (error instanceof HttpException) {
//       throw error;
//     }
//     throw new HttpException(
//       INTERNAL_SERVER_ERROR_MESSAGE,
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     );
//   }

//   async uploadSingleFile(
//     filename: string,
//     file: Buffer,
//     folder: string,
//   ): Promise<void> {
//     try {
//       await this.s3Client.send(
//         new PutObjectCommand({
//           Body: file,
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: `${folder}/${filename}`,
//         }),
//       );
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   async uploadMultiFile(
//     files: Express.Multer.File[],
//     folder: string,
//   ): Promise<void> {
//     try {
//       const storageQueries = files.map((file) =>
//         this.s3Client.send(
//           new PutObjectCommand({
//             Body: file.buffer,
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: `${folder}/${file.filename}`,
//           }),
//         ),
//       );
//       await Promise.all(storageQueries);
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   async deleteFile(filename: string, folder: string): Promise<void> {
//     try {
//       await this.s3Client.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: `${folder}/${filename}`,
//         }),
//       );
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   getFileLink(filename: string, folder: string): string {
//     return `${process.env.S3_FILE_PATH_URL}/${folder}/${filename}`;
//   }
// }

// * Cloudinary

import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import * as path from 'path';

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private handleError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (
      error?.message?.includes('ENOTFOUND') ||
      error?.message?.includes('ECONNREFUSED')
    ) {
      throw new ServiceUnavailableException(
        'Error connecting to Cloudinary. Please try again later.',
      );
    }

    throw new HttpException(
      INTERNAL_SERVER_ERROR_MESSAGE,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const publicId = path.parse(filename).name;
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      stream.end(buffer);
    });
  }

  async uploadSingleFile(
    filename: string,
    file: Buffer,
    folder: string,
  ): Promise<string> {
    try {
      const result = await this.uploadBuffer(file, filename, folder);

      return result.secure_url;
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadMultiFile(files: any[], folder: string): Promise<string[]> {
    try {
      const uploads = files.map((file) =>
        this.uploadBuffer(file.buffer, file.filename, folder),
      );

      const results = await Promise.all(uploads);

      return results.map((item) => item.secure_url);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFile(filename: string, folder: string): Promise<void> {
    try {
      const publicId = `${folder}/${path.parse(filename).name}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.handleError(error);
    }
  }

  getFileLink(filename: string, folder: string): string {
    return cloudinary.url(`${folder}/${filename}`, {
      secure: true,
    });
  }
}
