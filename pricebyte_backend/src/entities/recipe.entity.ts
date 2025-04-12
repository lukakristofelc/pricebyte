import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity';
import { RecipeDetail } from './recipe-detail.entity';

@Entity({ tableName: 'recipes' })
export class Recipe {
    @PrimaryKey({ autoincrement: true })
    recipe_id!: number;

    @Property()
    recipe_name!: string;

    @ManyToOne(() => User, { fieldName: 'user_id' }) // Specify the correct column name
    user!: User;

    @OneToMany(() => RecipeDetail, detail => detail.recipe)
    recipeDetails = new Collection<RecipeDetail>(this);
}