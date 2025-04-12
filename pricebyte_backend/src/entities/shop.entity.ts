import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { OrderEntity } from './order.entity';

@Entity({ tableName: 'shops' })
export class ShopEntity {
    @PrimaryKey({ columnType: 'int', fieldName: 'shop_id' })
    shopId!: number;

    @Property({ length: 100 })
    shopName!: string;

    @OneToMany(() => OrderEntity, (order) => order.shop)
    orders = new Collection<OrderEntity>(this);
}
