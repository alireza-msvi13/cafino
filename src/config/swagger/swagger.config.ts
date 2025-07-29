import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { SwaggerDocument } from "./swagger.enum";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export function SwaggerConfigInit(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle(SwaggerDocument.Title)
        .setDescription(SwaggerDocument.Description)
        .setContact("Alireza Mousavi", "", "alireza-msvi1313@gmail.com")
        .setVersion(SwaggerDocument.Version)
        .addBearerAuth(SwaggerAuthConfig(), "Authorization")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const theme = new SwaggerTheme();
    const options = {
        explorer: true,
        customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI)
    };
    SwaggerModule.setup(SwaggerDocument.Path, app, document, options)
}
function SwaggerAuthConfig(): SecuritySchemeObject {
    return {
        type: "http",
        bearerFormat: "JWT",
        in: "header",
        scheme: "bearer"
    }
}