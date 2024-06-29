// 判断是否是网址
export function isNetAddress(url: string) {
  if (/^https?:\/\//.exec(url)) return true;
  return !!/\.(com|cn)\/?/.exec(url);
}

// 如果不是以 http 开头的，加上 https://
export function addressFix(url: string) {
  if (/^https?:\/\//.exec(url)) {
    return url;
  } else {
    return `https://${url}`;
  }
}
