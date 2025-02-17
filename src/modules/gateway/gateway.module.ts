import { Global, Module } from "@nestjs/common";
import { ZarinpalService } from "./zarinpal.service";

@Global()
@Module({
  providers: [ZarinpalService],
  exports: [ZarinpalService],
})
export class GatewayModule { }
