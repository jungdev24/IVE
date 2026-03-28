import { handleOptions, jsonResponse } from './_shared.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || '아이브 안유진';
  const cid = url.searchParams.get('cid');
  const csec = url.searchParams.get('csec');

  if (!cid || !csec) {
    return jsonResponse({ error: 'naver API keys required' });
  }

  try {
    const naverUrl = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q)}&display=30&sort=date`;
    const resp = await fetch(naverUrl, {
      headers: { 'X-Naver-Client-Id': cid, 'X-Naver-Client-Secret': csec },
    });
    const data = await resp.json();
    return jsonResponse(data);
  } catch (e) {
    return jsonResponse({ error: e.message });
  }
}
