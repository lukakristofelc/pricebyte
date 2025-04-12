import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {Recipe} from "../../entities/recipe.entity";
import {RecipeController} from "./recipe.controller";
import {RecipeService} from "./recipe.service";

@Module({
    imports: [MikroOrmModule.forFeature([Recipe])],
    controllers: [RecipeController],
    providers: [RecipeService],
})
export class RecipeModule {}