import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { RecipeDetail } from './entities/recipe-detail.entity';
import { Shop } from './entities/shop.entity';
import { defineConfig } from '@mikro-orm/postgresql';
import {UserModule} from "./modules/user/user.module";
import {Recipe} from "./entities/recipe.entity";
import {ShopModule} from "./modules/shop/shop.module";
import {RecipeModule} from "./modules/recipe/recipe.module";
import {Allergy} from "./entities/allergy-entity";
import {UserAllergies} from "./entities/user-allergies.entity";
import {AllergyModule} from "./modules/allergies/allergy.module";

//TODO: MOVE TO ENV
@Module({
  imports: [
    MikroOrmModule.forRoot(defineConfig({
      dbName: 'defaultdb',
      host: 'pricebyte-pricebyte.b.aivencloud.com',
      port: 23424,
      user: 'avnadmin',
      entities: [User, RecipeDetail, Shop, Recipe, Allergy, UserAllergies],
      debug: true,
      allowGlobalContext: true,
      driverOptions: {
        connection: {
          ssl: { rejectUnauthorized: false }
        }
      },
    })), UserModule, ShopModule, RecipeModule, AllergyModule

  ],
})
export class AppModule {}
