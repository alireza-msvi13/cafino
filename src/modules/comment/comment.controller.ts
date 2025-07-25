import { Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortCommentDto } from './dto/sort-comment.dto';
import { Roles } from 'src/common/enums/role.enum';




@Controller('comment')
@ApiTags('Comment')
@UseGuards(JwtGuard)
export class CommentController {
  constructor(private commentService: CommentService) { }

  @Post("/")
  @ApiOperation({ summary: "create new comment for menu item" })
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Res() response: Response,
    @GetUser("role") role: Roles,
    @GetUser("id") userId: string,
  ) {
    return this.commentService.createComment(createCommentDto, response, userId, role);
  }


  @Get(":id/comments")
  @ApiOperation({ summary: "get comments for menu item" })
  async getItemComments(
    @Param("id") itemId: string,
    @Query() query: SortCommentDto,
    @Res() response: Response
  ) {
    return await this.commentService.getCommentsForItem(itemId, query, response);
  }


  @Get("/")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "see all comments by admin" })
  getAllComment(
    @Query() paginationDto: PaginationDto,
    @Res() response: Response,
  ) {
    return this.commentService.getAllComment(paginationDto, response)
  }
  @Put("/accept/:id")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "accept comment for menu item by admin" })
  acceptComment(
    @Param("id", UUIDValidationPipe) id: string,
    @Res() response: Response) {
    return this.commentService.acceptComment(id, response)
  }
  @Put("/reject/:id")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "reject comment for menu item by admin" })
  rejectComment(
    @Param("id", UUIDValidationPipe) id: string,
    @Res() response: Response) {
    return this.commentService.rejectComment(id, response)
  }
}
