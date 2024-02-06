export function articleUrlToSlug(articleUrl: string) {
  const result = articleUrl.match("https://www.jianshu.com/p/(\\w{12})");
  if (result !== null && result[1] !== undefined) {
    return result[1];
  }
  return null;
}

export function userUrlToSlug(userUrl: string) {
  const result = userUrl.match("https://www.jianshu.com/u/(\\w{6,12})");
  if (result !== null && result[1] !== undefined) {
    return result[1];
  }
  return null;
}
