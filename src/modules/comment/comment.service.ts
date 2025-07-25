import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemService } from '../item/item.service';
import e, { response, Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortCommentDto } from './dto/sort-comment.dto';
import { SortCommentOption } from 'src/common/enums/sort-comment-option.enum';
import { Roles } from 'src/common/enums/role.enum';

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
    userId: string,
    role: Roles
  )
    : Promise<Response> {
    try {

      const { parentId, text, itemId, star } = createCommentDto;

      const item = await this.itemService.checkItemExist(itemId);
      if (!item) throw new NotFoundException("item not found");

      let parent = null;
      if (parentId) {
        parent = await this.commentRepository.findOneBy({ id: parentId });
      }

      const starValue = parent?.id ? null : (star ?? 5);

      const newComment = this.commentRepository.create({
        text,
        star: starValue,
        item: { id: itemId },
        parent: parent ? { id: parentId } : null,
        user: { id: userId },
        accept: role === Roles.Admin ? true : false
      });

      await this.commentRepository.save(newComment);


      return response.status(HttpStatus.CREATED).json({
        message: "Comment Created Successfully",
        statusCode: HttpStatus.CREATED,
      });
    } catch (error) {
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
        .leftJoin("comment.user", "user")
        .leftJoin("comment.parent", "parent")
        .leftJoin("comment.item", "item")

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
          "user.email",
          "item.id",
          "item.title",
          "parent.id"
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const responseData = data.map(comment => ({
        ...comment,
        is_reply: !!comment.parent
      }));

      return response.status(HttpStatus.OK).json({
        data: responseData,
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
  async getCommentsForItem(
    itemId: string,
    query: SortCommentDto,
    response: Response
  ) {

    const { page = 1, limit = 10, sortBy = SortCommentOption.Newest } = query;
    const skip = (page - 1) * limit;

    const [comments] = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.user", "user")
      .leftJoin("comment.children", "child")
      .leftJoin("child.user", "childUser")
      .where("comment.item_id = :itemId", { itemId })
      .andWhere("comment.accept = true")
      .andWhere("comment.parent_id IS NULL")
      .select([
        // Parent comment
        "comment.id",
        "comment.text",
        "comment.created_at",
        "comment.star",

        // Parent comment's user
        "user.id",
        "user.first_name",
        "user.last_name",
        "user.username",
        "user.phone",
        "user.email",

        // Child comments
        "child.id",
        "child.text",
        "child.created_at",

        // Child comment's user
        "childUser.id",
        "childUser.first_name",
        "childUser.last_name",
        "childUser.username",
        "childUser.phone",
        "childUser.email",
      ])
      .orderBy(`comment.${this.getOrderColumn(sortBy)}`, this.getOrderDirection(sortBy))
      .addOrderBy("child.created_at", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const total = await this.commentRepository
      .createQueryBuilder("comment")
      .where("comment.item_id = :itemId", { itemId })
      .andWhere("comment.accept = true")
      .getCount();


    return response.status(HttpStatus.OK).json({
      data: {
        comments,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      statusCode: HttpStatus.OK,
    });
  }
  async acceptComment(id: string, response: Response): Promise<Response> {
    try {
      const comment = await this.getCommentById(id);

      if (comment.accept) throw new BadRequestException("Comment is Already Accepted");

      comment.accept = true;
      await this.commentRepository.save(comment);

      let itemId = comment.item?.id

      if (comment.star !== null && itemId) {
        const { avg, count } = await this.commentRepository
          .createQueryBuilder("comment")
          .select("AVG(comment.star)", "avg")
          .addSelect("COUNT(comment.id)", "count")
          .where("comment.item_id = :itemId", { itemId })
          .andWhere("comment.accept = true")
          .andWhere("comment.star IS NOT NULL")
          .getRawOne();

        const rating = parseFloat((parseFloat(avg) || 0).toFixed(1));
        const ratingCount = parseInt(count, 10) || 0;

        await this.itemService.updateItemRating(itemId, rating, ratingCount);

      }


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
      const comment = await this.getCommentById(id);
      if (!comment.accept) throw new BadRequestException("Comment is Already Rejected");
      comment.accept = false;
      await this.commentRepository.save(comment);
      return response.status(HttpStatus.OK).json({
        message: "Comment Status Changed To Reject Successfully",
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
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
  async getCommentById(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: { item: true },
      select: {
        id: true,
        accept: true,
        star: true,
        item: {
          id: true,
        },
      },
    });

    if (!comment) throw new NotFoundException("comment not found");
    return comment;
  }
  private getOrderColumn(sortBy: SortCommentOption): string {
    switch (sortBy) {
      case SortCommentOption.Newest:
      case SortCommentOption.Oldest:
        return "created_at";
      case SortCommentOption.HighestRated:
      case SortCommentOption.LowestRated:
        return "star";
      default:
        return "created_at";
    }
  }
  private getOrderDirection(sortBy: SortCommentOption): "ASC" | "DESC" {
    switch (sortBy) {
      case SortCommentOption.Newest:
      case SortCommentOption.HighestRated:
        return "DESC";
      case SortCommentOption.Oldest:
      case SortCommentOption.LowestRated:
        return "ASC";
      default:
        return "DESC";
    }
  }

}
