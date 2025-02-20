import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from '../../user/user.service';
import { JwtPayload } from "src/common/types/jwt-payload-type";
import { Roles } from "src/common/enums/role.enum";


@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
    constructor(
        private userService: UserService
    ) {
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.headers["access-token"] ?
                    request?.headers["access-token"] :
                    request?.cookies["access-token"]
                return data ? data : null;
            }])
        })
    }
    async validate(
        payload: JwtPayload
    ): Promise<{ phone: string, id: string }> {
        if (!payload || payload == null || !payload?.phone?.startsWith("09")) {
            throw new UnauthorizedException("Token is Not Valid")
        }
        const {
            phone,
            role,
            id
        } = await this.userService.findUser(
            payload.phone
        );
        if (role == Roles.User) {
            throw new UnauthorizedException("You Dont Have Access")
        }
        return {
            id,
            phone
        };
    }
}