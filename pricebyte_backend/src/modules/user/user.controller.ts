import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {User} from "../../entities/user.entity";
import {UserService} from "./user.service";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

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
