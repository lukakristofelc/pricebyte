import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AllergyService } from './allergy.service';
import { Allergy } from '../../entities/allergy-entity';
import { AssignAllergyDto, CreateAllergyDto, UpdateAllergyDto } from './allergy.dto';
import { UserAllergies } from '../../entities/user-allergies.entity';

@Controller('allergies')
export class AllergyController {
    constructor(private readonly allergyService: AllergyService) {}

    @Get()
    async findAll(): Promise<Allergy[]> {
        return this.allergyService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Allergy> {
        const allergy = await this.allergyService.findOne(+id);
        if (!allergy) {
            throw new HttpException('Allergy not found', HttpStatus.NOT_FOUND);
        }
        return allergy;
    }

    @Post()
    async create(@Body() createAllergyDto: CreateAllergyDto): Promise<Allergy> {
        return this.allergyService.create(createAllergyDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateAllergyDto: UpdateAllergyDto,
    ): Promise<Allergy> {
        const allergy = await this.allergyService.update(+id, updateAllergyDto);
        if (!allergy) {
            throw new HttpException('Allergy not found', HttpStatus.NOT_FOUND);
        }
        return allergy;
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.allergyService.remove(+id);
    }

    // User allergies endpoints
    @Get('user/:userId')
    async getUserAllergies(@Param('userId') userId: string): Promise<Allergy[]> {
        try {
            return await this.allergyService.getUserAllergies(+userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('assign')
    async assignAllergy(@Body() assignDto: AssignAllergyDto): Promise<UserAllergies> {
        try {
            return await this.allergyService.assignAllergyToUser(
                assignDto.user_id,
                assignDto.allergy_id
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('user/:userId/allergy/:allergyId')
    async removeAllergyFromUser(
        @Param('userId') userId: string,
        @Param('allergyId') allergyId: string,
    ): Promise<void> {
        return this.allergyService.removeAllergyFromUser(+userId, +allergyId);
    }
}