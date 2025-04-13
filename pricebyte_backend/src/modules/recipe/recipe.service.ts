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
        return await this.recipeRepo.findAll({
            populate: ['recipeDetails']
        });
    }

    async findOne(id: number): Promise<Recipe | null> {
        return await this.recipeRepo.findOne({ recipe_id: id });
    }

    async create(recipeData: CreateRecipeDto): Promise<Recipe> {
        try {
            // Find the user
            const user = await this.em.findOne(User, { user_id: recipeData.user_id });
            if (!user) throw new Error(`User with ID ${recipeData.user_id} not found`);

            // Create recipe (without details at first)
            const recipe = new Recipe();
            recipe.recipe_name = recipeData.recipe_name;
            recipe.user = user;

            // Persist the recipe first to get its ID
            await this.em.persistAndFlush(recipe);

            // Now create and add the recipe details
            for (const detailData of recipeData.recipeDetails) {
                const shop = await this.em.findOne(Shop, { shopId: detailData.shop_id });
                if (!shop) throw new Error(`Shop with ID ${detailData.shop_id} not found`);

                const detail = new RecipeDetail();
                detail.recipe = recipe;  // Sets recipe_id
                detail.shop = shop;      // Sets shop_id
                detail.productName = detailData.productName;
                detail.qty = detailData.qty;
                detail.price = detailData.price;
                detail.orderTimestamp = new Date();

                // Add to the recipe's collection
                recipe.recipeDetails.add(detail);

                // Persist each detail separately
                await this.em.persist(detail);
            }

            // Flush all changes to database
            await this.em.flush();

            return recipe;
        } catch (error) {
            console.error('Error creating recipe:', error);
            throw new Error(`Failed to create recipe: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        const recipe = await this.recipeRepo.findOne({ recipe_id: id });
        if (recipe) {
            await this.em.removeAndFlush(recipe);
        }
    }
}