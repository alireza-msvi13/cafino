import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountDto } from './dto/discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entity/discount.entity';
import { Between, DeepPartial, MoreThan, Repository } from 'typeorm';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { DiscountQueryDto } from './dto/sort-discount.dto';
import { DiscountSortField } from './enum/discount.enum';
import { CartService } from '../cart/cart.service';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
  ) {}

  // * primary

  async generate(discountDto: DiscountDto): Promise<ServerResponse> {
    const { amount, code, expires_in, limit, percent } = discountDto;

    const isDiscountCodeExsit = await this.discountRepository.findOneBy({
      code,
    });

    if (isDiscountCodeExsit) throw new ConflictException('Code already exsit');

    const discountObject: DeepPartial<DiscountEntity> = { code };

    if ((!amount && !percent) || (amount && percent)) {
      throw new BadRequestException(
        'You must enter one of the Amount or Percent fields.',
      );
    }
    if (amount) discountObject.amount = amount;
    else if (percent) discountObject.percent = percent;

    if (limit) discountObject.limit = limit;

    const now = new Date();
    const expiresDate = new Date(
      now.getTime() + 1000 * 60 * 60 * 24 * expires_in,
    );
    expiresDate.setHours(0, 0, 0, 0);
    discountObject.expires_in = expiresDate;

    const discount = this.discountRepository.create(discountObject);

    await this.discountRepository.save(discount);

    return new ServerResponse(
      HttpStatus.CREATED,
      'Discount generated successfully.',
    );
  }
  async findAll(query: DiscountQueryDto): Promise<ServerResponse> {
    const { sortBy, isActive, page = 1, limit = 10 } = query;

    const qb = this.discountRepository.createQueryBuilder('discount');

    if (isActive !== undefined) {
      qb.andWhere('discount.active = :isActive', { isActive });
    }

    switch (sortBy) {
      case DiscountSortField.Newest:
        qb.orderBy('discount.created_at', 'DESC');
        break;
      case DiscountSortField.Oldest:
        qb.orderBy('discount.created_at', 'ASC');
        break;
      default:
        qb.orderBy('discount.created_at', 'DESC');
    }

    const total = await qb.getCount();

    const discounts = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(
      HttpStatus.OK,
      'Discounts fetched successfully.',
      {
        total,
        page,
        limit,
        discounts,
      },
    );
  }
  async delete(id: string): Promise<ServerResponse> {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException('Discount Not Found');
    await this.cartService.deactivateDiscountInCarts(discount.id);
    await this.discountRepository.softRemove(discount);
    return new ServerResponse(HttpStatus.OK, 'Discount deleted successfully.');
  }
  async updateActivityStatus(
    id: string,
    status: boolean,
  ): Promise<ServerResponse> {
    const discount = await this.discountRepository.findOneBy({ id });

    if (!discount) {
      throw new NotFoundException('Discount Not Found.');
    }

    if (discount.active === status) {
      throw new ConflictException(
        `Discount is already ${status ? 'active' : 'inactive'}.`,
      );
    }

    const now = Date.now();

    if (
      discount.limit !== null &&
      discount.limit !== undefined &&
      discount.limit <= discount.usage
    ) {
      throw new BadRequestException('Discount code expired.');
    }

    if (discount.expires_in && discount.expires_in.getTime() <= now) {
      throw new BadRequestException('Discount code expired.');
    }

    if (discount.active && status === false) {
      await this.cartService.deactivateDiscountInCarts(discount.id);
    }

    await this.discountRepository.update({ id }, { active: status });

    return new ServerResponse(
      HttpStatus.OK,
      `Discount status updated to ${status ? 'active' : 'inactive'}.`,
    );
  }

  // * helper

  async findOneByCode(code: string) {
    const discount = await this.discountRepository.findOneBy({ code });
    if (!discount) throw new NotFoundException('Discount Not Found');
    return discount;
  }

  // * admin dashboard reports

  async countActiveDiscounts() {
    return this.discountRepository.count({
      where: { active: true },
    });
  }
  async getExpiringDiscounts(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return this.discountRepository.find({
      where: {
        expires_in: Between(now, future),
        active: true,
      },
      select: ['code', 'usage', 'active'],
      order: { expires_in: 'ASC' },
      take: 5,
    });
  }
  async getTopDiscountCodes(limit: number = 5) {
    return this.discountRepository.find({
      select: ['code', 'usage', 'active'],
      order: { usage: 'DESC' },
      take: limit,
      where: { usage: MoreThan(0) },
    });
  }
  async incrementUsage(id: string): Promise<void> {
    await this.discountRepository
      .createQueryBuilder()
      .update()
      .set({
        usage: () => `"usage" + 1`,
        active: () =>
          `CASE WHEN "limit" IS NOT NULL AND "usage" + 1 >= "limit" THEN false ELSE active END`,
      })
      .where('id = :id', { id })
      .execute();
  }

  async deactivateExpiredDiscounts(): Promise<void> {
    const now = new Date();
    await this.discountRepository
      .createQueryBuilder()
      .update()
      .set({ active: false })
      .where('expires_in IS NOT NULL AND expires_in <= :now', { now })
      .execute();
  }
}
