import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortAdminCommentDto, SortCommentDto } from './dto/sort-comment.dto';
import { Roles } from 'src/common/enums/role.enum';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import {
  AcceptCommentDoc,
  CreateCommentDoc,
  GetAllCommentsDoc,
  GetItemCommentsDoc,
  RejectCommentDoc,
} from './decorators/swagger.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('/')
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(JwtGuard, RateLimitGuard)
  @CreateCommentDoc()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('role') role: Roles,
    @GetUser('id') userId: string,
  ) {
    return this.commentService.createComment(createCommentDto, userId, role);
  }

  @Get(':id/comments')
  @GetItemCommentsDoc()
  async getItemComments(
    @Param('id', UUIDValidationPipe) itemId: string,
    @Query() query: SortCommentDto,
  ) {
    return await this.commentService.getCommentsForItem(itemId, query);
  }

  @Get('/')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @GetAllCommentsDoc()
  getAllComments(@Query() query: SortAdminCommentDto) {
    return this.commentService.getAllComments(query);
  }

  @Put('/accept/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @AcceptCommentDoc()
  acceptComment(@Param('id', UUIDValidationPipe) id: string) {
    return this.commentService.acceptComment(id);
  }

  @Put('/reject/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @RejectCommentDoc()
  rejectComment(@Param('id', UUIDValidationPipe) id: string) {
    return this.commentService.rejectComment(id);
  }
}
