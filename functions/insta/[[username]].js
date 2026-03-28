import { handleOptions, jsonResponse } from '../_shared.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  const username = context.params.username.join('/');
  if (!username) {
    return jsonResponse({ error: 'username required', images: [] });
  }

  try {
    const embedUrl = `https://www.instagram.com/${username}/embed/`;
    const resp = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': 'https://www.google.com/',
      },
      redirect: 'follow',
    });
    const html = await resp.text();
    const htmlLen = html.length;

    const unescaped = html.replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '"');

    const imgRegex = /https:\/\/scontent[a-z0-9-]*\.cdninstagram\.com\/v\/t51\.82787-15\/[^"'\s\\)]+\.jpg[^"'\s\\)]*/g;
    const allUrls = unescaped.match(imgRegex) || [];

    const seen = new Set();
    const images = [];
    allUrls.forEach(u => {
      const fname = u.match(/\/([A-Za-z0-9_]+)_[0-9]+_[0-9]+_n\.jpg/)?.[1]
        || u.match(/\/([^/]+)\.jpg/)?.[1] || '';
      if (!fname || seen.has(fname)) return;
      seen.add(fname);
      if (u.includes('p1080x') || u.includes('e35_p')) {
        images.unshift(u);
      } else {
        images.push(u);
      }
    });

    return jsonResponse({
      images, count: images.length, source: `ig:${username}`,
      debug: { htmlLen, rawMatches: allUrls.length }
    });
  } catch (e) {
    return jsonResponse({ error: e.message, images: [] });
  }
}
