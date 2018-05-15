const URL_ID_RE = /([^/]+)\/$/;

export function idFromUrl(url) {
  const matches = url.match(URL_ID_RE);
  if (!matches || matches.length < 2) return null;
  return matches[1];
}
