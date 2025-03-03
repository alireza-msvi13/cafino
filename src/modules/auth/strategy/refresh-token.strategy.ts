import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { JwtPayload } from "src/common/types/jwt-payload-type";
import { UserService } from "src/modules/user/user.service";


@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {
        super({
            ignoreExpiration: false,
            passReqToCallback: true,
            secretOrKey: process.env.REFRESH_TOKEN_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.headers["refresh-token"] ?
                    request?.headers["refresh-token"] :
                    request?.cookies["refresh-token"]
                return data ? data : null;
            }])
        })
    }
    async validate(
        request: Request,
        payload: JwtPayload
    ): Promise<{ phone: string, id: string }> {
        if (!payload || !payload?.phone?.startsWith("09")) {
            throw new UnauthorizedException("token is not valid")
        }
        const refreshToken = request?.cookies["refresh-token"];
        const { phone, id } = await this.authService.validRefreshToken(
            refreshToken,
            payload.phone
        );
        return {
            phone,
            id
        };
    }
}
