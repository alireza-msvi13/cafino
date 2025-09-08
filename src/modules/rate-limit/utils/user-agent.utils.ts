import * as UAParser from 'ua-parser-js';

export function parseUserAgent(uaString: string) {
  const parser = new UAParser.UAParser(uaString);
  const result = parser.getResult();

  const browser = result.browser.name || 'unknown';
  const browserVersion = result.browser.version?.split('.')[0] || '0';

  const os = result.os.name || 'unknown';
  const osVersion = result.os.version || '';

  const deviceType = result.device.type || 'desktop';

  return {
    browser: `${browser}/${browserVersion}`,
    os: `${os} ${osVersion}`,
    device: deviceType,
  };
}
