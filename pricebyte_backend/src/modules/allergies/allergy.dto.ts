
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAllergyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateAllergyDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class AssignAllergyDto {
    @IsNotEmpty()
    user_id: number;

    @IsNotEmpty()
    allergy_id: number;
}