import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemService } from '../item/item.service';
import { SortAdminCommentDto, SortCommentDto } from './dto/sort-comment.dto';
import { SortCommentOption } from './enum/comment.enum';
import { Roles } from 'src/common/enums/role.enum';
import { ServerResponse } from 'src/common/dto/server-response.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => ItemService)) private itemService: ItemService,
  ) {}

  // *primary

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
    role: Roles,
  ): Promise<ServerResponse> {
    const { parentId, text, itemId, star } = createCommentDto;

    const item = await this.itemService.checkItemExist(itemId);
    if (!item) throw new NotFoundException('Item not found.');

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
      accept: role !== Roles.User ? true : false,
    });

    await this.commentRepository.save(newComment);

    return new ServerResponse(
      HttpStatus.CREATED,
      'Comment created successfully.',
    );
  }
  async getAllComments(sortDto: SortAdminCommentDto): Promise<ServerResponse> {
    const {
      limit = 10,
      page = 1,
      sortBy = SortCommentOption.Newest,
      accept,
      itemId,
      userId,
      phone,
    } = sortDto;

    const baseQuery = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.item', 'item');

    if (accept !== undefined) {
      baseQuery.andWhere('comment.accept = :accept', { accept });
    }

    if (itemId) {
      baseQuery.andWhere('item.id = :itemId', { itemId });
    }

    if (userId) {
      baseQuery.andWhere('user.id = :userId', { userId });
    }

    if (phone) {
      baseQuery.andWhere('user.phone = :phone', { phone });
    }

    if (
      sortBy === SortCommentOption.HighestRated ||
      sortBy === SortCommentOption.LowestRated
    ) {
      baseQuery.andWhere('comment.parent IS NULL');
    }

    baseQuery.orderBy(
      `comment.${this.getOrderColumn(sortBy)}`,
      this.getOrderDirection(sortBy),
    );

    const total = await baseQuery.getCount();

    const data = await baseQuery
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'comment.id',
        'comment.text',
        'comment.accept',
        'comment.star',
        'comment.created_at',
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.username',
        'item.id',
        'item.title',
        'parent.id',
      ])
      .getMany();

    const comments = data.map((comment) => ({
      ...comment,
      is_reply: !!comment.parent,
    }));

    return new ServerResponse(HttpStatus.OK, 'Comments fetched successfully.', {
      total,
      page,
      limit,
      comments,
    });
  }
  async getCommentsForItem(
    itemId: string,
    query: SortCommentDto,
  ): Promise<ServerResponse> {
    const { page = 1, limit = 10, sortBy = SortCommentOption.Newest } = query;
    const skip = (page - 1) * limit;

    const [comments] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.children', 'child')
      .leftJoin('child.user', 'childUser')
      .where('comment.item_id = :itemId', { itemId })
      .andWhere('comment.accept = true')
      .andWhere('comment.parent_id IS NULL')
      .select([
        // Parent comment
        'comment.id',
        'comment.text',
        'comment.created_at',
        'comment.star',

        // Parent comment's user
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.username',
        'user.email',

        // Child comments
        'child.id',
        'child.text',
        'child.created_at',

        // Child comment's user
        'childUser.id',
        'childUser.first_name',
        'childUser.last_name',
        'childUser.username',
        'childUser.email',
      ])
      .orderBy(
        `comment.${this.getOrderColumn(sortBy)}`,
        this.getOrderDirection(sortBy),
      )
      .addOrderBy('child.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const total = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.item_id = :itemId', { itemId })
      .andWhere('comment.accept = true')
      .getCount();

    return new ServerResponse(HttpStatus.OK, 'Comments fetched successfully.', {
      total,
      page,
      limit,
      comments,
    });
  }
  async acceptComment(id: string): Promise<ServerResponse> {
    const comment = await this.getCommentById(id);

    if (comment.accept)
      throw new ConflictException('Comment is already accepted.');

    comment.accept = true;
    await this.commentRepository.save(comment);

    let itemId = comment.item?.id;

    if (comment.star !== null && itemId) {
      const { avg, count } = await this.commentRepository
        .createQueryBuilder('comment')
        .select('AVG(comment.star)', 'avg')
        .addSelect('COUNT(comment.id)', 'count')
        .where('comment.item_id = :itemId', { itemId })
        .andWhere('comment.accept = true')
        .andWhere('comment.star IS NOT NULL')
        .getRawOne();

      const rating = parseFloat((parseFloat(avg) || 0).toFixed(1));
      const ratingCount = parseInt(count, 10) || 0;

      await this.itemService.updateItemRating(itemId, rating, ratingCount);
    }

    return new ServerResponse(
      HttpStatus.OK,
      'Comment status changed to accept successfully.',
    );
  }
  async rejectComment(id: string): Promise<ServerResponse> {
    const comment = await this.getCommentById(id);
    if (!comment.accept)
      throw new ConflictException('Comment is already rejected.');
    comment.accept = false;
    await this.commentRepository.save(comment);
    return new ServerResponse(
      HttpStatus.OK,
      'Comment status changed to reject successfully.',
    );
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

    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }
  private getOrderColumn(sortBy: SortCommentOption): string {
    switch (sortBy) {
      case SortCommentOption.Newest:
      case SortCommentOption.Oldest:
        return 'created_at';
      case SortCommentOption.HighestRated:
      case SortCommentOption.LowestRated:
        return 'star';
      default:
        return 'created_at';
    }
  }
  private getOrderDirection(sortBy: SortCommentOption): 'ASC' | 'DESC' {
    switch (sortBy) {
      case SortCommentOption.Newest:
      case SortCommentOption.HighestRated:
        return 'DESC';
      case SortCommentOption.Oldest:
      case SortCommentOption.LowestRated:
        return 'ASC';
      default:
        return 'DESC';
    }
  }

  // *admin dashboard reports

  async countComments(): Promise<number> {
    return this.commentRepository.count();
  }
  async countAcceptedComments(): Promise<number> {
    return this.commentRepository.count({ where: { accept: true } });
  }
  async countUnacceptedComments(): Promise<number> {
    return this.commentRepository.count({ where: { accept: false } });
  }
  async getlatestUnacceptedComments(): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
      where: { accept: false },
    });
  }
}
