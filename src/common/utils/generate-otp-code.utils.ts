import * as crypto from "crypto";
export const generateOtpCode = (): string => crypto.randomInt(10000, 99999).toString();
export const generateInvoiceNumber = (): number => crypto.randomInt(10000000000, 99999999999)
