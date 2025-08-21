import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { ZarinpalRequestDto } from "./dto/zarinpal.dto";

@Injectable()
export class ZarinpalService {
  private readonly merchantId = process.env.ZARINPAL_MERCHANT_ID;
  private readonly requestUrl = process.env.ZARINPAL_REQUEST_URL;
  private readonly verifyUrl = process.env.ZARINPAL_VERIFY_URL;
  private readonly gatewayUrl = process.env.ZARINPAL_GATEWAY_URL;
  private readonly callbackUrl = process.env.ZARINPAL_CALLBACK_URL;



  // * priamry

  async sendRequest(data: ZarinpalRequestDto) {
    const { amount, description, user } = data;
    const options = {
      merchant_id: this.merchantId,
      amount: amount * 10,
      description,
      metadata: {
        email: user?.email ?? "",
        mobile: user?.mobile ?? "",
      },
      callback_url: this.callbackUrl,
    };

    const result = await this.handleRequest(this.requestUrl, options);
    const { authority, code } = result;

    if (code === 100 && authority) {
      return {
        code,
        authority,
        gatewayURL: `${this.gatewayUrl}/${authority}`,
      };
    }

    throw new BadRequestException("connection failed in zarinpal");
  }
  async verifyRequest(authority: string, amount: number) {
    const options = {
      authority: authority,
      amount: amount * 10,
      merchant_id: this.merchantId,
    };
    const data = await this.handleRequest(this.verifyUrl, options)
    if (data.code !== 100 || !data.ref_id) throw new NotFoundException()

    return data
  }

  // *helper

  private async handleRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, { timeout: 5000, maxRedirects: 5 });
      return response.data.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error in zarinpal request.');
    }
  }
}
