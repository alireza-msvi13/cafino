import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DiscountDto } from "./dto/discount.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountEntity } from "./entity/discount.entity";
import { DeepPartial, Repository } from "typeorm";
import { ServerResponse } from "src/common/dto/server-response.dto";
import { DiscountQueryDto } from "./dto/sort-discount.dto";

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>
  ) { }

  // * primary

  async generate(discountDto: DiscountDto): Promise<ServerResponse> {
    const { amount, code, expires_in, limit, percent } = discountDto;

    const isDiscountCodeExsit = await this.discountRepository.findOneBy({ code });

    if (isDiscountCodeExsit) throw new ConflictException("Code already exsit");

    const discountObject: DeepPartial<DiscountEntity> = { code };

    if ((!amount && !percent) || (amount && percent)) {
      throw new BadRequestException(
        "You must enter one of the Amount or Percent fields."
      );
    }
    if (amount) discountObject.amount = amount;

    else if (percent) discountObject.percent = percent;


    if (expires_in) {
      const time = 1000 * 60 * 60 * 24 * expires_in;
      discountObject.expires_in = new Date(new Date().getTime() + time);
    }
    if (limit) discountObject.limit = limit;

    const discount = this.discountRepository.create(discountObject);

    await this.discountRepository.save(discount);

    return new ServerResponse(HttpStatus.CREATED, 'Discount generated successfully.');

  }
  async findAll(query: DiscountQueryDto): Promise<ServerResponse> {
    const { sortBy = 'created_at', order = 'DESC', isActive } = query;
    const now = new Date();

    await this.discountRepository
      .createQueryBuilder()
      .update()
      .set({ active: false })
      .where('(expires_in IS NOT NULL AND expires_in <= :now) OR (limit IS NOT NULL AND limit <= usage)', { now })
      .execute();


    const qb = this.discountRepository.createQueryBuilder('discount');

    if (isActive !== undefined) {
      qb.andWhere('discount.active = :isActive', { isActive });
    }

    qb.orderBy(`discount.${sortBy}`, order);

    const discounts = await qb.getMany();

    return new ServerResponse(HttpStatus.OK, 'Discounts fetched successfully.', { discounts });
  }

  async delete(id: string): Promise<ServerResponse> {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException("Discount Not Found");
    await this.discountRepository.delete({ id });
    return new ServerResponse(HttpStatus.OK, 'Discount deleted successfully.');
  }
  async updateActivityStatus(id: string, status: boolean): Promise<ServerResponse> {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException("Discount Not Found");
    await this.discountRepository.update({ id }, {
      active: status
    });
    return new ServerResponse(HttpStatus.OK, `Discount status updated to ${status ? 'active' : 'inactive'}.`);
  }

  // * helper
  async findOneByCode(code: string) {
    const discount = await this.discountRepository.findOneBy({ code });
    if (!discount) throw new NotFoundException("Discount Not Found");
    return discount;
  }
}
