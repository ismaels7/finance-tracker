import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';


export interface TokenPayload {
    id: string
    email: string,
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(email: string, password: string, response: Response) {
        const expires = new Date();
        expires.setSeconds(
            expires.getSeconds() + this.configService.getOrThrow('JWT_EXPIRATION'),
        );
        console.log('login attempt in auth service for email:', email)
        const user = await this.userService.findUserByEmail(email)

        if (!user) { throw new Error('User not found') }

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) { throw new UnauthorizedException('Invalid credentials') }

        const tokenPayload = {
            id: user.id,
            email: user.email
        };

        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            httpOnly: true,
            secure: true,
            expires,
        })

        return response.json({ message: 'Login successful' })
    }


    async logout(response: Response) {
        response.clearCookie('Authentication', {
            httpOnly: true,
        });
        return response.json({ message: 'Logged out successfully' });
    }
}