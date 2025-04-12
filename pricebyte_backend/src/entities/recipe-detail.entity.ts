import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Recipe } from './recipe.entity';
import { Shop } from './shop.entity';

@Entity({ tableName: 'recipe_details' })
export class RecipeDetail {
    @ManyToOne(() => Recipe, { fieldName: 'recipe_id', primary: true })
    recipe!: Recipe;

    @ManyToOne(() => Shop, { fieldName: 'shop_id', primary: true })
    shop!: Shop;

    @Property({ fieldName: 'product_name' })
    productName!: string;

    @Property()
    qty!: number;

    @Property()
    price!: number;

    @Property({ fieldName: 'order_timestamp' })
    orderTimestamp!: Date;
}