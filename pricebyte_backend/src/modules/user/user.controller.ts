import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {User} from "../../entities/user.entity";
import {UserService} from "./user.service";
import {LoginDto, RegisterDto} from "./user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() userData: RegisterDto): Promise<{ success: boolean; user?: Partial<User>; message?: string }> {
        try {
            // Check if user exists
            const userExists = await this.userService.findByUsername(userData.username);
            if (userExists) {
                return { success: false, message: 'Username already exists' };
            }

            // Check if email exists
            const emailExists = await this.userService.findByEmail(userData.email);
            if (emailExists) {
                return { success: false, message: 'Email already registered' };
            }

            // Create new user with already hashed password from frontend
            const newUser = await this.userService.create({
                username: userData.username,
                email: userData.email,
                password_hash: userData.password_hash, // Already hashed from frontend
            });

            // Return user data
            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, message: 'Registration failed' };
        }
    }

    @Post('login')
    async login(@Body() loginData: LoginDto): Promise<{ success: boolean; user?: User; message?: string }> {
        const user = await this.userService.findByEmail(loginData.email);

        if (user) {
            return { success: true, user };
        } else {
            return { success: false, message: 'User not found' };
        }
    }

    @Get()
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<User | null> {
        return this.userService.findOne(+id);
    }

    @Post()
    create(@Body() data: Pick<User, 'username' | 'password_hash' | 'email'>): Promise<User> {
        return this.userService.create(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(+id);
    }
}
