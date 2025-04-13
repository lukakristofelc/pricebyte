import { Entity, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';
import { Allergy } from './allergy-entity';

@Entity({ tableName: 'user_allergies' })
export class UserAllergies {
    @PrimaryKey({ autoincrement: true })
    id!: number;

    @ManyToOne(() => User, { fieldName: 'user_id' })
    user!: User;

    @ManyToOne(() => Allergy, { fieldName: 'allergy_id' })
    allergy!: Allergy;
}