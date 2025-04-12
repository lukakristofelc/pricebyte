import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import {Recipe} from "./recipe.entity";

@Entity({ tableName: 'users' })
export class User {
    @PrimaryKey()
    user_id!: number;

    @Property()
    username!: string;

    @Property({ unique: true })
    email!: string;

    @Property({ hidden: true })
    password_hash!: string;

    @OneToMany(() => Recipe, recipe => recipe.user)
    recipes = new Collection<Recipe>(this);
}