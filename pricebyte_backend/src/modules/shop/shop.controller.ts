import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {ShopService} from "./shop.service";
import {Shop} from "../../entities/shop.entity";

@Controller('shops')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @Get()
    findAll(): Promise<Shop[]> {
        return this.shopService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Shop | null> {
        return this.shopService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.shopService.remove(+id);
    }
}
