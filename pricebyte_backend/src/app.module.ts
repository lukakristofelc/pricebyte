import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { OrderEntity } from './entities/order.entity';
import { ShopEntity } from './entities/shop.entity';
import { defineConfig } from '@mikro-orm/postgresql';
import {ShopModule} from "./modules/shop/shop.module";
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(defineConfig({
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      entities: [User, OrderEntity, ShopEntity],
      debug: process.env.NODE_ENV !== 'production',
      allowGlobalContext: true,
      driverOptions: {
        connection: {
          ssl: { rejectUnauthorized: false }
        }
      },
    })),
    ShopModule,
  ],
})
export class AppModule {}
