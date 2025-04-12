import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopEntity } from '../../entities/shop.entity';

@Controller('shops')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @Get()
    findAll(): Promise<ShopEntity[]> {
        return this.shopService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<ShopEntity | null> {
        return this.shopService.findOne(+id);
    }

    /*
    @Post()
    create(@Body() data: Partial<ShopEntity>): Promise<ShopEntity> {
        return this.shopService.create(data);
    }*/

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.shopService.remove(+id);
    }
}
