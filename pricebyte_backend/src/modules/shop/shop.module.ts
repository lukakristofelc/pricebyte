import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ShopEntity } from '../../entities/shop.entity';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';

@Module({
    imports: [MikroOrmModule.forFeature([ShopEntity])],
    controllers: [ShopController],
    providers: [ShopService],
})
export class ShopModule {}