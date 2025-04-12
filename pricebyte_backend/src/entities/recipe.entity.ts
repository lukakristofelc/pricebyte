import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity';
import { RecipeDetail } from './recipe-detail.entity';

@Entity({ tableName: 'recipes' })
export class Recipe {
    @PrimaryKey({ type: 'integer', columnType: 'int4(32,0)' })
    recipe_id?: number;

    @Property({ length: 100 })
    recipe_name!: string;

    @ManyToOne(() => User)
    user!: User;

    @OneToMany(() => RecipeDetail, recipeDetail => recipeDetail.recipe)
    recipeDetails = new Collection<RecipeDetail>(this);
}
