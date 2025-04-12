import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password_hash: string; // Already hashed from frontend

    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;
}