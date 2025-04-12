import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import {User} from "../../entities/user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<User[]> {
        return await this.userRepo.findAll();
    }

    async findOne(id: number): Promise<User | null> {
        return await this.userRepo.findOne({ user_id: id });
    }

    async create(userData: Pick<User, 'username' | 'password_hash' | 'email'>): Promise<User> {
        const data = { ...userData} as User;
        const user = this.em.create(User, data);

        await this.em.persistAndFlush(user);

        return user;
    }


    async remove(id: number): Promise<void> {
        const user = await this.userRepo.findOne({ user_id: id });
        if (user) {
            await this.em.removeAndFlush(user);
        }
    }
}