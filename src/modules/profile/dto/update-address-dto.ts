import { PartialType } from '@nestjs/swagger';
import { AddAddressDto } from './add-address-dto';

export class UpdateAddressDto extends PartialType(AddAddressDto) {}
