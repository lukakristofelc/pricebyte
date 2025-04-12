import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import {Shop} from "../../entities/shop.entity";

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepo: EntityRepository<Shop>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<Shop[]> {
        return await this.shopRepo.findAll();
    }

    async findOne(id: number): Promise<Shop | null> {
        return await this.shopRepo.findOne({ shopId: id });
    }

/*    async create(userData: Pick<User, 'username' | 'password_hash' | 'email'>): Promise<User> {
        const data = { ...userData} as User;
        const user = this.em.create(User, data);

        await this.em.persistAndFlush(user);

        return user;
    }
*/

    async remove(id: number): Promise<void> {
        const user = await this.shopRepo.findOne({ shopId: id });
        if (user) {
            await this.em.removeAndFlush(user);
        }
    }
}