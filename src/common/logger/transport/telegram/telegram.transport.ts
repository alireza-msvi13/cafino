import * as Transport from 'winston-transport';
import axios from 'axios';
import { isShouldSendToTelegram } from './should-send-to-telegram';

interface TelegramTransportOptions extends Transport.TransportStreamOptions {
  botToken: string;
  chatId: string;
}

export class TelegramTransport extends Transport {
  private botToken: string;
  private chatId: string;

  constructor(opts: TelegramTransportOptions) {
    super(opts);
    this.botToken = opts.botToken;
    this.chatId = opts.chatId;
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    if (!isShouldSendToTelegram(info)) {
      return callback();
    }

    const {
      level = 'error',
      message,
      stack,
      timestamp = new Date().toISOString(),
      path,
      method,
      statusCode,
      ip,
      identifier,
      userId,
      userAgent = {},
    } = info;

    const time = this.formatDate(new Date(timestamp));

    const html = `
<b>🚨 [${this.escape(level.toUpperCase())}]</b>
<b>🕐 Time:</b> ${this.escape(time)}
<b>📡 Status:</b> ${this.escape(statusCode ?? 'Unknown')}
<b>🔗 Path:</b> ${this.escape(method ?? 'N/A')} ${this.escape(path ?? '')}

<b>📝 Message:</b>
<pre>${this.escape(message)}</pre>
${
  stack
    ? `<b>🧵 Stack Trace:</b>\n<pre>${this.escape(stack.slice(0, 3500))}</pre>`
    : ''
}

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
<b>📥 Request Info:</b>

<b>🧾 Identifier:</b> ${this.escape(identifier ?? 'N/A')}
<b>🆔 User ID:</b> ${this.escape(userId ?? 'Unknown')}
<b>🌐 IP:</b> ${this.escape(ip ?? 'Unknown')}
<b>🧭 User Agent:</b>
• <b>Browser</b>: ${this.escape(userAgent.browser ?? 'Unknown')}  
• <b>OS</b>: ${this.escape(userAgent.os ?? 'Unknown')}  
• <b>Device</b>: ${this.escape(userAgent.device ?? 'Unknown')}
    `.trim();

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: html,
          parse_mode: 'HTML',
        },
      );
    } catch (err) {
      // console.error('Failed to send log to Telegram:', err.message);
    }

    callback();
  }

  private escape(text: unknown): string {
    if (typeof text !== 'string') {
      try {
        text = JSON.stringify(text, null, 2);
      } catch {
        text = String(text ?? '');
      }
    }

    return (text as string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace('T', ' ').replace(/\..+/, '');
  }
}
