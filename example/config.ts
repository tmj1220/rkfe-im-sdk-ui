const env = process.env.NODE_ENV || 'local';

console.log(env);

const ws = {
  local: 'wss://im-devwss.rokid-inc.com',
  dev: 'wss://im-devwss.rokid-inc.com',
  test: 'wss://im-testwss.rokid-inc.com',
  prod: 'wss://im-wss.rokid.com',
};

const http = {
  local: 'https://im-dev.rokid-inc.com',
  dev: 'https://im-dev.rokid-inc.com',
  test: 'https://im-test.rokid-inc.com',
  prod: 'https://im.rokid.com',
};

const saas = {
  local: 'https://saas-ar-dev.rokid-inc.com',
  dev: 'https://saas-ar-dev.rokid-inc.com',
  test: 'https://saas-ar-test.rokid.com',
  prod: 'https://saas-ar.rokid.com',
};

export const WS = ws[env];
export const HTTP = http[env];
export const SAAS = saas[env];

export const TOKEN_KEY = 'TOKEN';
export const USER_ID_KEY = 'USER_ID';
