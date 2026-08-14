/**
 * Client-side HTML / DOM Sanitizer
 * Prevents Cross-Site Scripting (XSS) by stripping dangerous tags, inline event handlers,
 * and javascript: pseudo-protocols from raw HTML strings before passing to dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirtyHtml?: string | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  let sanitized = dirtyHtml;

  // 1. Remove dangerous executable script and embed tags with content
  sanitized = sanitized.replace(/<(script|iframe|object|embed|form|base|meta|head|html|body|link)[^>]*>[\s\S]*?<\/\1>/gi, '');
  sanitized = sanitized.replace(/<(script|iframe|object|embed|form|base|meta|head|html|body|link)[^>]*\/?>/gi, '');

  // 2. Remove inline event handlers (on* attributes e.g., onerror, onload, onclick, onmouseover)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Neutralize javascript: and vbscript: URIs in href / src attributes
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(['"]?)\s*(?:javascript|vbscript):/gi, '$1=$2#');

  // 4. Remove style attributes containing expression(...) or javascript:
  sanitized = sanitized.replace(/style\s*=\s*(['"]?)[^'"]*(?:expression|javascript|behavior)[^'"]*\1/gi, '');

  return sanitized;
}
