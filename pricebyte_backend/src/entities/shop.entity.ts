import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { RecipeDetail } from './recipe-detail.entity';

@Entity({ tableName: 'shops' })
export class Shop {
    @PrimaryKey({ type: 'integer', columnType: 'int4(32,0)' })
    shopId!: number;

    @Property({ length: 100 })
    shopName!: string;

    @OneToMany(() => RecipeDetail, recipeDetail => recipeDetail.shop)
    recipeDetails = new Collection<RecipeDetail>(this);
}