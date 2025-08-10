export class ServerResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
