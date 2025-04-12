import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';
import { ShopEntity } from './shop.entity';

@Entity({ tableName: 'orders' })
export class OrderEntity {
    @PrimaryKey({ columnType: 'int' })
    id!: number;

    @Property({ columnType: 'int' })
    orderId!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne()
    shop!: ShopEntity;

    @Property({ length: 100 })
    productName!: string;

    @Property({ columnType: 'int' })
    qty!: number;

    @Property({ columnType: 'numeric', precision: 10, scale: 2 })
    price!: number;

    @Property({ columnType: 'timestamp' })
    orderTimestamp!: Date;
}