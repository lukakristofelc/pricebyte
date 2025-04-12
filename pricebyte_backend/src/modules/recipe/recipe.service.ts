import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import {Recipe} from "../../entities/recipe.entity";
import {User} from "../../entities/user.entity";
import {RecipeDetail} from "../../entities/recipe-detail.entity";
import {Shop} from "../../entities/shop.entity";

@Injectable()
export class RecipeService {
    constructor(
        @InjectRepository(Recipe)
        private readonly recipeRepo: EntityRepository<Recipe>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<Recipe[]> {
        return await this.recipeRepo.findAll();
    }

    async findOne(id: number): Promise<Recipe | null> {
        return await this.recipeRepo.findOne({ recipe_id: id });
    }

    async create(recipeData: CreateRecipeDto): Promise<Recipe> {
        const user = await this.em.findOne(User, { user_id: recipeData.user_id });
        if (!user) throw new Error(`User with ID ${recipeData.user_id} not found`);

        const recipe = this.em.create(Recipe, {
            recipe_name: recipeData.recipe_name,
            user: user
        });

        // Process each recipe detail
        for (const detailData of recipeData.recipeDetails) {
            const shop = await this.em.findOne(Shop, { shopId: detailData.shop_id });
            if (!shop) throw new Error(`Shop with ID ${detailData.shop_id} not found`);

            // Create RecipeDetail, don't include recipeDetailId (it will be auto-generated)
            const detail = this.em.create(RecipeDetail, {
                recipe: recipe,
                shop: shop,
                productName: detailData.productName,
                qty: detailData.qty,
                price: detailData.price,
                orderTimestamp: new Date()
            });

            recipe.recipeDetails.add(detail);
        }

        await this.em.persistAndFlush(recipe);

        return recipe;
    }

    async remove(id: number): Promise<void> {
        const user = await this.recipeRepo.findOne({ recipe_id: id });
        if (user) {
            await this.em.removeAndFlush(user);
        }
    }
}