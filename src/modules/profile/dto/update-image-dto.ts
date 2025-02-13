import { ApiProperty } from "@nestjs/swagger";
import { MulterFileType } from "src/common/types/multer.file.type";


export class UpdateImageDto {

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    image: MulterFileType

}