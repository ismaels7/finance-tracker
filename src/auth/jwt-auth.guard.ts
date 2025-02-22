import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest } from "./types/types";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGaurd implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector){}
    
    
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const allowUnauthorizedRequest = this.reflector.get<boolean>('allowUnauthorizedRequest', context.getHandler());
        const token = request.cookies?.Authentication;
        console.log('TOKEN_FROM_COOKIES', token)

        if (allowUnauthorizedRequest) {
            return true
        }

        if(!token && !allowUnauthorizedRequest){
            throw new UnauthorizedException('Authentication token is missing')
        }

        try {
            const payload = this.jwtService.verify(token);
            request.user = payload;
            return  true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token')
        }
    }
}