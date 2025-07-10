import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemService } from '../item/item.service';
import e, { Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CommentService {

  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => ItemService)) private itemService: ItemService
  ) { }


  // *primary
  async createComment(
    createCommentDto: CreateCommentDto,
    response: Response,
    userId: string)
    : Promise<Response> {
    try {

      const { parentId, text, itemId } = createCommentDto;

      const item = await this.itemService.checkItemExist(itemId)
      if (!item) throw new NotFoundException("item not found");

      let parent = null;
      if (parentId) {
        parent = await this.commentRepository.findOneBy({ id: parentId });
      }
      const newComment = this.commentRepository.create({
        text,
        item: { id: itemId },
        parent: parent ? { id: parentId } : null,
        user: { id: userId },
      });

      await this.commentRepository.save(newComment)


      return response.status(HttpStatus.CREATED).json({
        message: "Comment Created Successfully",
        statusCode: HttpStatus.CREATED,
      });
    } catch (error) {
      console.log(error);

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
  async getAllComment(
    paginationDto: PaginationDto,
    response: Response
  ): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = paginationDto;

      const baseQuery = this.commentRepository
        .createQueryBuilder("comment")
        .leftJoin("comment.user", "user");


      const total = await baseQuery.getCount();


      const data = await baseQuery
        .select([
          "comment.id",
          "comment.text",
          "comment.accept",
          "comment.created_at",
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.username",
          "user.phone",
          "user.email"
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return response.status(HttpStatus.OK).json({
        data,
        total,
        page,
        limit,
        statusCode: HttpStatus.OK
      });

    } catch (error) {
      console.log(error);

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

  async acceptComment(id: string, response: Response): Promise<Response> {
    try {
      const comment = await this.checkCommentExist(id);
      if (comment.accept) throw new BadRequestException();
      comment.accept = true;
      await this.commentRepository.save(comment);
      return response.status(HttpStatus.OK).json({
        message: "Comment Status Changed To Accept Successfully",
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.log(error);

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
  async rejectComment(id: string, response: Response): Promise<Response> {
    try {
      const comment = await this.checkCommentExist(id);
      if (!comment.accept) throw new BadRequestException();
      comment.accept = false;
      await this.commentRepository.save(comment);
      return response.status(HttpStatus.OK).json({
        message: "Comment Status Changed To Reject Successfully",
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.log(error);
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

  // *helper
  async checkCommentExist(id: string) {
    const comment = await this.commentRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException("comment not found");
    return comment;
  }

}
