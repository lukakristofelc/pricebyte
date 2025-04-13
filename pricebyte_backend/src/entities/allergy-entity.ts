import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { UserAllergies } from './user-allergies.entity';

@Entity({ tableName: 'allergies' })
export class Allergy {
    @PrimaryKey()
    allergy_id!: number;

    @Property({ length: 100 })
    name!: string;

    @OneToMany(() => UserAllergies, userAllergy => userAllergy.allergy)
    userAllergies = new Collection<UserAllergies>(this);
}