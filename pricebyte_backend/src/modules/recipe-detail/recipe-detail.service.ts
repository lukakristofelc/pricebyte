import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import {RecipeDetail} from "../../entities/recipe-detail.entity";

@Injectable()
export class RecipeDetailService {
    constructor(
        @InjectRepository(RecipeDetail)
        private readonly recipeRepo: EntityRepository<RecipeDetail>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<RecipeDetail[]> {
        return await this.recipeRepo.findAll();
    }

    async findOne(id: number): Promise<RecipeDetail | null> {
        return await this.recipeRepo.findOne({ recipeDetailId: id });
    }

    /*
    async create(recipeDetailData: Pick<RecipeDetail, 'username' | 'password_hash' | 'email'>): Promise<RecipeDetail> {
        const data = { ...recipeDetailData} as RecipeDetail;
        const user = this.em.create(RecipeDetail, data);

        await this.em.persistAndFlush(user);

        return user;
    }*/



    async remove(id: number): Promise<void> {
        const user = await this.recipeRepo.findOne({ recipeDetailId: id });
        if (user) {
            await this.em.removeAndFlush(user);
        }
    }
}