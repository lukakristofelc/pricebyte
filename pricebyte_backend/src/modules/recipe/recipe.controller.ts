import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {RecipeService} from "./recipe.service";
import {Recipe} from "../../entities/recipe.entity";

@Controller('recipe')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    findAll(): Promise<Recipe[]> {
        return this.recipeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipeService.findOne(+id);
    }


    @Post()
    create(@Body() createRecipeDto: CreateRecipeDto): Promise<Recipe> {
        return this.recipeService.create(createRecipeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.recipeService.remove(+id);
    }
}
