import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { ShopEntity } from '../../entities/shop.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(ShopEntity)
        private readonly shopRepo: EntityRepository<ShopEntity>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<ShopEntity[]> {
        return await this.shopRepo.findAll();
    }

    async findOne(id: number): Promise<ShopEntity | null> {
        return await this.shopRepo.findOne({ shopId: id });
    }

    /*
    async create(data: Partial<ShopEntity>): Promise<ShopEntity> {
        const shop = this.em.create(ShopEntity, data);
        await this.em.persistAndFlush(shop);
        return shop;
    }*/

    async remove(id: number): Promise<void> {
        const shop = await this.shopRepo.findOne({ shopId: id });
        if (shop) {
            await this.em.removeAndFlush(shop);
        }
    }
}