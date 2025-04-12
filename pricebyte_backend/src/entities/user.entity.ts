import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { OrderEntity } from './order.entity';

@Entity({ tableName: 'users' })
export class User {
    @PrimaryKey({ columnType: 'int', fieldName: 'user_id' })
    userId!: number;

    @Property({ length: 100 })
    username!: string;

    @Property({ length: 255 })
    passwordHash!: string;

    @Property({ fieldName: 'created', columnType: 'timestamp' })
    created: Date = new Date();

    @OneToMany(() => OrderEntity, (order) => order.user)
    orders = new Collection<OrderEntity>(this);
}