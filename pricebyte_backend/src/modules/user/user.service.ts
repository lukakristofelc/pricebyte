import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import {User} from "../../entities/user.entity";
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
        private readonly em: EntityManager,
        private readonly jwtService: JwtService
    ) {}

    async findAll(): Promise<User[]> {
        return await this.userRepo.findAll();
    }

    async findOne(id: number): Promise<User | null> {
        return await this.userRepo.findOne({ user_id: id });
    }

    async create(userData: Pick<User, 'username' | 'password_hash' | 'email'>): Promise<User> {
        const data = { ...userData} as User;
        const user = this.em.create(User, data);

        await this.em.persistAndFlush(user);

        return user;
    }

    async remove(id: number): Promise<void> {
        const user = await this.userRepo.findOne({ user_id: id });
        if (user) {
            await this.em.removeAndFlush(user);
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepo.findOne({ username });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findOne({ email });
    }

    // New methods for JWT authentication

    generateToken(user: User): string {
        const payload = {
            sub: user.user_id,
            username: user.username,
            email: user.email
        };

        return this.jwtService.sign(payload);
    }

    verifyToken(token: string): any {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            return null;
        }
    }

    validatePassword(plainPassword: string, hashedPassword: string): boolean {
        return plainPassword === hashedPassword;
    }
}