import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const StringToArray = createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        console.log(request.body[data]);

        request.body[data] = request.body[data].split(",");
        return null;
    }
)