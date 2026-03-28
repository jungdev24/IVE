import { handleOptions, jsonResponse, extractMedia } from '../_shared.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  const username = context.params.username.join('/');
  if (!username) {
    return jsonResponse({ error: 'username required', images: [] });
  }

  try {
    const synUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}`;
    const resp = await fetch(synUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const html = await resp.text();
    const result = extractMedia(html, `@${username}`);
    return jsonResponse(result);
  } catch (e) {
    return jsonResponse({ error: e.message, images: [] });
  }
}
