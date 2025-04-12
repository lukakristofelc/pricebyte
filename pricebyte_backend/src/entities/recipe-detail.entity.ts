import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Recipe } from './recipe.entity';
import { Shop } from './shop.entity';

@Entity({ tableName: 'recipe_details' })
export class RecipeDetail {
    @PrimaryKey({ type: 'integer', columnType: 'int4(32,0)' })
    recipeDetailId!: number;

    @ManyToOne(() => Recipe)
    recipe!: Recipe;

    @ManyToOne(() => Shop)
    shop!: Shop;

    @Property({ length: 100 })
    productName!: string;

    @Property()
    qty!: number;

    @Property({ columnType: 'numeric(10,2)' })
    price!: number;

    @Property()
    orderTimestamp: Date = new Date();
}