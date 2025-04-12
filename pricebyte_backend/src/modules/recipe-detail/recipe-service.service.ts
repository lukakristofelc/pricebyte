import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, Reference } from '@mikro-orm/core';
import { RecipeDetail } from '../../entities/recipe-detail.entity';
import { Recipe } from '../../entities/recipe.entity';
import { Shop } from '../../entities/shop.entity';

@Injectable()
export class RecipeDetailService {
    constructor(
        @InjectRepository(RecipeDetail)
        private readonly recipeDetailRepo: EntityRepository<RecipeDetail>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<RecipeDetail[]> {
        return await this.recipeDetailRepo.findAll();
    }

    async findByRecipeId(recipeId: number): Promise<RecipeDetail[]> {
        return await this.recipeDetailRepo.find({
            recipe: { recipe_id: recipeId }
        });
    }

    async findByShopId(shopId: number): Promise<RecipeDetail[]> {
        return await this.recipeDetailRepo.find({
            shop: { shopId: shopId }
        });
    }

    async findOne(recipeId: number, shopId: number): Promise<RecipeDetail | null> {
        return await this.recipeDetailRepo.findOne({
            recipe: { recipe_id: recipeId },
            shop: { shopId: shopId }
        });
    }

    async update(recipeId: number, shopId: number, updateData: Partial<RecipeDetail>): Promise<RecipeDetail> {
        const recipeDetail = await this.findOne(recipeId, shopId);
        if (!recipeDetail) {
            throw new Error(`Recipe detail with recipe ID ${recipeId} and shop ID ${shopId} not found`);
        }

        // Update fields
        if (updateData.productName) recipeDetail.productName = updateData.productName;
        if (updateData.qty) recipeDetail.qty = updateData.qty;
        if (updateData.price) recipeDetail.price = updateData.price;
        if (updateData.orderTimestamp) recipeDetail.orderTimestamp = updateData.orderTimestamp;

        await this.em.persistAndFlush(recipeDetail);
        return recipeDetail;
    }

    async remove(recipeId: number, shopId: number): Promise<void> {
        const recipeDetail = await this.findOne(recipeId, shopId);
        if (recipeDetail) {
            await this.em.removeAndFlush(recipeDetail);
        }
    }

    async removeAllByRecipeId(recipeId: number): Promise<void> {
        const recipeDetails = await this.findByRecipeId(recipeId);

        if (recipeDetails.length > 0) {
            recipeDetails.forEach(detail => {
                this.em.remove(detail);
            });

            await this.em.flush();
        }
    }
}