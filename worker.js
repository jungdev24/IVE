export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // /x/{username} → Twitter syndication API
    if (path.startsWith('/x/')) {
      const username = path.replace('/x/', '').replace(/\//g, '');
      if (!username) {
        return new Response(JSON.stringify({ error: 'username required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const synUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}`;
        const resp = await fetch(synUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        const html = await resp.text();

        // pbs.twimg.com 이미지 URL 추출
        const imgRegex = /https:\/\/pbs\.twimg\.com\/media\/[A-Za-z0-9_-]+\.(jpg|png)/g;
        const matches = [...new Set(html.match(imgRegex) || [])];
        const images = matches.map(u => u + '?format=jpg&name=large');

        return new Response(JSON.stringify({ images, count: images.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message, images: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // /naver?q=검색어&cid=xxx&csec=xxx → Naver image search proxy
    if (path === '/naver') {
      const q = url.searchParams.get('q') || '아이브 안유진';
      const cid = url.searchParams.get('cid');
      const csec = url.searchParams.get('csec');

      if (!cid || !csec) {
        return new Response(JSON.stringify({ error: 'naver API keys required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const naverUrl = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q)}&display=30&sort=date`;
        const resp = await fetch(naverUrl, {
          headers: {
            'X-Naver-Client-Id': cid,
            'X-Naver-Client-Secret': csec,
          },
        });
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('IVE Fan App API', { headers: corsHeaders });
  },
};
