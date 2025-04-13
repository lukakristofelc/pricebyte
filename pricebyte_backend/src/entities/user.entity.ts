import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import {Recipe} from "./recipe.entity";
import {ManyToMany} from "@mikro-orm/postgresql";
import {UserAllergies} from "./user-allergies.entity";


@Entity({ tableName: 'users' })
export class User {
    @PrimaryKey()
    user_id!: number;

    @Property()
    username!: string;

    @Property({ unique: true })
    email!: string;

    @Property()
    password_hash!: string;

    @OneToMany(() => Recipe, recipe => recipe.user)
    recipes = new Collection<Recipe>(this);

    @OneToMany(() => UserAllergies, userAllergy => userAllergy.user)
    userAllergies = new Collection<UserAllergies>(this);
}