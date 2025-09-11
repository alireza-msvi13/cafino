import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortTicket, TicketStatus } from '../enum/ticket.enum';

export class SortTicketDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SortTicket })
  @IsOptional()
  @IsEnum(SortTicket)
  sortBy?: SortTicket = SortTicket.Newest;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
