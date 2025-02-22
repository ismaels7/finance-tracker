import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SetMetadata } from '@nestjs/common';

export const AllowUnauthorizedRequest = () => SetMetadata('allowUnauthorizedRequest', true);


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService){}

    @AllowUnauthorizedRequest()
    @Post('create')
    async createUser(
        @Body('email') email: string,
        @Body('password') password: string) {
            const newUser = await this.userService.createUser(email, password)
        return { message: 'User created successfully', user: newUser, unauthorized: true}
    }

    @AllowUnauthorizedRequest()
    @Get()
    async getUsers() {
        return await this.userService.getAllUsers();
    }
}
