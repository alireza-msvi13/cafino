import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule ,TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }
