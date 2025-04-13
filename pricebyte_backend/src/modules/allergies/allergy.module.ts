import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AllergyController } from './allergy.controller';
import { AllergyService } from './allergy.service';
import { Allergy } from '../../entities/allergy-entity';
import { UserAllergies } from '../../entities/user-allergies.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [MikroOrmModule.forFeature([Allergy, UserAllergies, User])],
    controllers: [AllergyController],
    providers: [AllergyService],
    exports: [AllergyService],
})
export class AllergyModule {}