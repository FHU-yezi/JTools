export function getBaseURL(): string {
  return window.location.origin;
}

export function getToolSlug(): string {
  return window.location.pathname.substring(1);
}
