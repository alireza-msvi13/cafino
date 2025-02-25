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
import { Response } from "express";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "src/common/constants/error.constant";

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>
  ) { }

  // * primary

  async generate(discountDto: DiscountDto, response: Response) {
    try {
      const { amount, code, expires_in, limit, percent } = discountDto;


      const isDiscountCodeExsit = await this.discountRepository.findOneBy({ code });
      if (isDiscountCodeExsit) throw new ConflictException("code already exsit");

      const discountObject: DeepPartial<DiscountEntity> = { code };

      if ((!amount && !percent) || (amount && percent)) {
        throw new BadRequestException(
          "You must enter one of the Amount or Percent fields"
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

      return response
        .status(HttpStatus.OK)
        .json({
          message: 'Discount Generated Successfully',
          statusCode: HttpStatus.OK
        })
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
  async findAll(response: Response) {
    try {
      const discounts = await this.discountRepository.find({});

      return response
        .status(HttpStatus.OK)
        .json({
          data: discounts,
          statusCode: HttpStatus.OK
        })
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
  async delete(id: string, response: Response) {
    try {
      const discount = await this.discountRepository.findOneBy({ id });
      if (!discount) throw new NotFoundException();
      await this.discountRepository.delete({ id });
      return response
        .status(HttpStatus.OK)
        .json({
          message: 'Discount Deleted Successfully',
          statusCode: HttpStatus.OK
        })

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

  // * helper
  async findOneByCode(code: string) {
    const discount = await this.discountRepository.findOneBy({ code });
    if (!discount) throw new NotFoundException();
    return discount;
  }
}
