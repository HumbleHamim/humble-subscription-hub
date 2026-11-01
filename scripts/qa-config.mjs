import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

function defaultChromePath() {
  const candidates = process.platform === 'win32'
    ? [
        process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
        process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
      ]
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? 'google-chrome';
}

export function getQaConfig(name, defaultPort) {
  const root = path.join(os.tmpdir(), 'humble-subscription-hub-qa');
  const userDataDir = process.env.QA_USER_DATA_DIR ?? path.join(root, `chrome-${name}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  return {
    chromePath: process.env.CHROME_PATH ?? defaultChromePath(),
    port: Number(process.env[`QA_${name.toUpperCase()}_PORT`] ?? defaultPort),
    base: process.env.BASE ?? 'http://localhost:3000',
    userDataDir,
    resultsPath: process.env.QA_OUTPUT ?? path.join(process.cwd(), 'qa-results.json'),
  };
}
