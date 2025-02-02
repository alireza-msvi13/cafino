import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { extname } from "path";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AllowdImageFormats } from "../constants/image-mime-type.constant";

export function UploadFileAws(fieldName: string) {
    return FileInterceptor(
        fieldName,
        {
            limits: {
                fileSize: 5 * 1024 * 1024
            },
            fileFilter(req, file, callback) {
                const ext = extname(file.originalname);
                if (!AllowdImageFormats.includes(ext)) {
                    return callback(
                        new HttpException(
                            "invalid file type",
                            HttpStatus.BAD_REQUEST
                        ),
                        null
                    )
                }
                const newName = `${Date.now()}${ext}`;
                file.filename = newName;
                callback(null, true)
            }
        })
}

export function UploadMultiFilesAws(fieldName: string) {
    return FilesInterceptor(
        fieldName,
        10,
        {
            limits: {
                fileSize: 5 * 1024 * 1024
            },
            fileFilter(req, file, callback) {
                const ext = extname(file.originalname);
                if (!AllowdImageFormats.includes(ext)) {
                    return callback(
                        new HttpException(
                            "invalid file type",
                            HttpStatus.BAD_REQUEST
                        ),
                        null
                    )
                }
                const newName = `${Date.now()}${ext}`;
                file.filename = newName;
                callback(null, true)
            }
        })
}