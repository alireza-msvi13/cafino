import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class PublicGuard extends AuthGuard('public') {
    handleRequest(err: any, user: any, info: any) {
        return user;
    }
}
