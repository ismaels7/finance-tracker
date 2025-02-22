import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthenticatedRequest } from './types/types';
import { AllowUnauthorizedRequest } from 'src/user/user.controller';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @AllowUnauthorizedRequest()
    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res() response: Response,
    ) {
        console.log('login endpoint hit in user.controller')
        return this.authService.login(email, password, response)
    }

    @Post('logout')
    async logout(
        @Res() response: Response
    ) {
        return this.authService.logout(response)
    }

    @Get('me')
    getMe(@Req() request: AuthenticatedRequest){
        console.log('Authenticated user: ', request.user)
        return request.user
    }

}
