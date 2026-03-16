export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // /x/{username} → 계정 타임라인에서 이미지+GIF+해시태그 추출
    if (path.startsWith('/x/')) {
      const username = path.replace('/x/', '').replace(/\//g, '');
      if (!username) {
        return Response.json({ error: 'username required', images: [] }, { headers: corsHeaders });
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
        return Response.json(result, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return Response.json({ error: e.message, images: [] }, { headers: corsHeaders });
      }
    }

    // /search?q=검색어 → 트위터 검색 (해시태그 등)
    if (path === '/search') {
      const q = url.searchParams.get('q') || '안유진';
      try {
        // Twitter syndication search endpoint
        const synUrl = `https://syndication.twitter.com/srv/timeline-search/screen-name/search?query=${encodeURIComponent(q)}`;
        let html = '';
        const resp = await fetch(synUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        html = await resp.text();

        // syndication search가 안되면 일반 검색 시도
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
        return Response.json(result, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return Response.json({ error: e.message, images: [] }, { headers: corsHeaders });
      }
    }

    // /naver?q=검색어&cid=xxx&csec=xxx
    if (path === '/naver') {
      const q = url.searchParams.get('q') || '아이브 안유진';
      const cid = url.searchParams.get('cid');
      const csec = url.searchParams.get('csec');
      if (!cid || !csec) {
        return Response.json({ error: 'naver API keys required' }, { headers: corsHeaders });
      }
      try {
        const naverUrl = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q)}&display=30&sort=date`;
        const resp = await fetch(naverUrl, {
          headers: { 'X-Naver-Client-Id': cid, 'X-Naver-Client-Secret': csec },
        });
        const data = await resp.json();
        return Response.json(data, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return Response.json({ error: e.message }, { headers: corsHeaders });
      }
    }

    // /insta/{username} → Instagram embed에서 이미지 추출
    if (path.startsWith('/insta/')) {
      const username = path.replace('/insta/', '').replace(/\//g, '');
      if (!username) {
        return Response.json({ error: 'username required', images: [] }, { headers: corsHeaders });
      }
      try {
        const embedUrl = `https://www.instagram.com/${username}/embed/`;
        const resp = await fetch(embedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        const html = await resp.text();

        // cdninstagram 이미지 URL 추출 (프로필 사진 제외, 게시물만)
        const imgRegex = /https:\/\/scontent[^"'\s]+?\.cdninstagram\.com\/v\/[^"'\s]+?\.jpg[^"'\s]*/g;
        const allUrls = html.match(imgRegex) || [];

        // 고해상도(1080)만 필터 + 중복 제거 + 프로필 사진 제외
        const seen = new Set();
        const images = [];
        allUrls.forEach(u => {
          const clean = u.split('\\u0026').join('&').split('\\').join('');
          if (clean.includes('/t51.82787-19/')) return; // 프로필 사진 제외
          // 같은 이미지의 다른 해상도 중복 제거 (파일명 기준)
          const fname = clean.match(/\/([^/]+)\.jpg/)?.[1] || clean;
          if (seen.has(fname)) return;
          seen.add(fname);
          images.push(clean);
        });

        return Response.json({ images, count: images.length, source: `@${username}` }, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return Response.json({ error: e.message, images: [] }, { headers: corsHeaders });
      }
    }

    return new Response('IVE Fan App API', { headers: corsHeaders });
  },
};

// 이미지 + GIF + 해시태그 추출
function extractMedia(html, source) {
  // 정지 이미지 (jpg, png)
  const imgRegex = /https:\/\/pbs\.twimg\.com\/media\/[A-Za-z0-9_-]+\.(jpg|png)/g;
  const imgMatches = [...new Set(html.match(imgRegex) || [])];
  const images = imgMatches.map(u => ({
    url: u + '?format=jpg&name=large',
    type: 'image',
  }));

  // GIF/동영상 (tweet_video_thumb → 실제는 MP4지만 썸네일은 jpg)
  const gifThumbRegex = /https:\/\/pbs\.twimg\.com\/tweet_video_thumb\/[A-Za-z0-9_-]+\.(jpg|png)/g;
  const gifThumbMatches = [...new Set(html.match(gifThumbRegex) || [])];

  // GIF MP4 URL
  const gifMp4Regex = /https:\/\/video\.twimg\.com\/tweet_video\/[A-Za-z0-9_-]+\.mp4/g;
  const gifMp4Matches = [...new Set(html.match(gifMp4Regex) || [])];

  const gifs = gifMp4Matches.map(u => ({
    url: u,
    type: 'gif',
  }));

  // GIF 썸네일만 있고 mp4 없는 경우 → 썸네일이라도 추가
  gifThumbMatches.forEach(thumb => {
    const id = thumb.match(/tweet_video_thumb\/([A-Za-z0-9_-]+)\./)?.[1];
    if (id && !gifMp4Matches.some(m => m.includes(id))) {
      gifs.push({ url: thumb + '?format=jpg&name=large', type: 'gif_thumb' });
    }
  });

  // 해시태그 추출
  const hashtagRegex = /#([A-Za-z가-힣0-9_]+)/g;
  const allHashtags = [...new Set((html.match(hashtagRegex) || []).map(h => h.replace('#', '')))];
  // 안유진 관련 해시태그만 필터 (너무 많으면)
  const tags = allHashtags.slice(0, 20);

  const all = [...images, ...gifs];

  return {
    images: all.map(m => m.url),
    media: all,
    tags,
    count: all.length,
    source,
  };
}
