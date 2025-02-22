import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGaurd } from "./jwt-auth.guard";

@Controller('protected')
export class ProtectedController {
    @Get()
    @UseGuards(JwtAuthGaurd)
    getProtected() {
        return { message: 'This is protected content'}
    }
}