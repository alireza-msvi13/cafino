import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortAdminCommentDto, SortCommentDto } from './dto/sort-comment.dto';
import { Roles } from 'src/common/enums/role.enum';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
  constructor(private commentService: CommentService) { }

  @Post("/")
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "Create new comment for menu item." })
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser("role") role: Roles,
    @GetUser("id") userId: string,
  ) {
    return this.commentService.createComment(createCommentDto, userId, role);
  }

  @Get(":id/comments")
  @ApiOperation({ summary: "Get comments for menu item." })
  async getItemComments(
    @Param("id") itemId: string,
    @Query() query: SortCommentDto
  ) {
    return await this.commentService.getCommentsForItem(itemId, query);
  }

  @Get("/")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "See all comments by admin." })
  getAllComment(
    @Query() query: SortAdminCommentDto
  ) {
    return this.commentService.getAllComment(query)
  }

  @Put("/accept/:id")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "Accept comment for menu item by admin." })
  acceptComment(
    @Param("id", UUIDValidationPipe) id: string) {
    return this.commentService.acceptComment(id)
  }

  @Put("/reject/:id")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "Reject comment for menu item by admin." })
  rejectComment(
    @Param("id", UUIDValidationPipe) id: string) {
    return this.commentService.rejectComment(id)
  }
}
