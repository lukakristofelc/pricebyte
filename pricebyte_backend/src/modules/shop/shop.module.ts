import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {ShopController} from "./shop.controller";
import {ShopService} from "./shop.service";
import {Shop} from "../../entities/shop.entity";

@Module({
    imports: [MikroOrmModule.forFeature([Shop])],
    controllers: [ShopController],
    providers: [ShopService],
})
export class ShopModule {}