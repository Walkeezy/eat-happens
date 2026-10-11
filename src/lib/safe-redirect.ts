/**
 * Where to send someone after they log in. Only same-origin paths are allowed, so a crafted `?next=` link
 * cannot bounce people to another site (`//evil.example` and `/\evil.example` are protocol-relative URLs).
 */
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }

  return value;
}
