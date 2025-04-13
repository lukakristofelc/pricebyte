import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Allergy } from '../../entities/allergy-entity';
import { CreateAllergyDto, UpdateAllergyDto } from './allergy.dto';
import { UserAllergies } from '../../entities/user-allergies.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AllergyService {
    constructor(
        @InjectRepository(Allergy)
        private readonly allergyRepo: EntityRepository<Allergy>,
        @InjectRepository(UserAllergies)
        private readonly userAllergiesRepo: EntityRepository<UserAllergies>,
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
        private readonly em: EntityManager,
    ) {}

    async findAll(): Promise<Allergy[]> {
        return await this.allergyRepo.findAll();
    }

    async findOne(id: number): Promise<Allergy | null> {
        return await this.allergyRepo.findOne({ allergy_id: id });
    }

    async create(allergyData: CreateAllergyDto): Promise<Allergy> {
        const allergy = this.em.create(Allergy, allergyData as Allergy);
        await this.em.persistAndFlush(allergy);
        return allergy;
    }

    async update(id: number, updateData: UpdateAllergyDto): Promise<Allergy | null> {
        const allergy = await this.allergyRepo.findOne({ allergy_id: id });
        if (!allergy) {
            return null;
        }

        if (updateData.name) {
            allergy.name = updateData.name;
        }

        await this.em.persistAndFlush(allergy);
        return allergy;
    }

    async remove(id: number): Promise<void> {
        const allergy = await this.allergyRepo.findOne({ allergy_id: id });
        if (allergy) {
            await this.em.removeAndFlush(allergy);
        }
    }

    // User Allergies operations
    async assignAllergyToUser(userId: number, allergyId: number): Promise<UserAllergies> {
        // Check if user exists
        const user = await this.userRepo.findOne({ user_id: userId });
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Check if allergy exists
        const allergy = await this.allergyRepo.findOne({ allergy_id: allergyId });
        if (!allergy) {
            throw new Error(`Allergy with ID ${allergyId} not found`);
        }

        // Check if assignment already exists
        const existingAssignment = await this.userAllergiesRepo.findOne({
            user: { user_id: userId },
            allergy: { allergy_id: allergyId }
        });

        if (existingAssignment) {
            return existingAssignment; // Already assigned
        }

        // Create new assignment
        const userAllergy = new UserAllergies();
        userAllergy.user = user;
        userAllergy.allergy = allergy;

        await this.em.persistAndFlush(userAllergy);
        return userAllergy;
    }

    async removeAllergyFromUser(userId: number, allergyId: number): Promise<void> {
        const userAllergy = await this.userAllergiesRepo.findOne({
            user: { user_id: userId },
            allergy: { allergy_id: allergyId }
        });

        if (userAllergy) {
            await this.em.removeAndFlush(userAllergy);
        }
    }

    async getUserAllergies(userId: number): Promise<Allergy[]> {
        const userAllergies = await this.userAllergiesRepo.find(
            { user: { user_id: userId } },
            { populate: ['allergy'] }
        );

        // Extract the allergy entities
        return userAllergies.map(ua => ua.allergy);
    }
}