import { handleOptions, jsonResponse, extractMedia } from './_shared.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || '안유진';

  try {
    const synUrl = `https://syndication.twitter.com/srv/timeline-search/screen-name/search?query=${encodeURIComponent(q)}`;
    let html = '';
    const resp = await fetch(synUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    html = await resp.text();

    if (!html || html.length < 200) {
      const altUrl = `https://syndication.twitter.com/srv/timeline-list/screen-name/search?query=${encodeURIComponent(q)}`;
      const resp2 = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      html = await resp2.text();
    }

    const result = extractMedia(html, q);
    return jsonResponse(result);
  } catch (e) {
    return jsonResponse({ error: e.message, images: [] });
  }
}
