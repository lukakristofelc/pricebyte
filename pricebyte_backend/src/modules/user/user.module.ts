import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {User} from "../../entities/user.entity";

@Module({
    imports: [MikroOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}