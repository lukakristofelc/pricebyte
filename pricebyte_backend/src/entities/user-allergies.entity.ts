import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { User } from './user.entity';

@Entity({ tableName: 'user_all' })
export class UserAllergies {
    @PrimaryKey()
    allergy_id?: number;

    @Property()
    name!: string;

    @ManyToOne(() => User, { fieldName: 'user_id' }) // Specify the correct column name
    user!: User;
}