import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
const mjml2html = require('mjml');

@Injectable()
export class MailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendReplyEmail(to: string, subject: string, replyMessage: string) {
    const mjmlTemplate = `
  <mjml>
    <mj-body background-color="#f4f4f4" font-family="Arial">
      <mj-section>
        <mj-column>
          <mj-text 
            font-size="20px" 
            color="#333" 
            font-weight="bold" 
            align="center"
            line-height="1.6"
          >
            ${subject}
          </mj-text>
          <mj-divider border-color="#cccccc" />
          <mj-text font-size="16px" color="#555" 
            line-height="1.6"
            align="center" 
          >
            ${replyMessage}
          </mj-text>
          <mj-spacer height="20px" />
          <mj-text font-size="14px" color="#999"
            align="center"
          >
            Cafino Support Team
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

    const { html } = mjml2html(mjmlTemplate);

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }
}
