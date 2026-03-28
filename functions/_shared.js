export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}

export function jsonResponse(data) {
  return Response.json(data, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 이미지 + GIF + 해시태그 추출
export function extractMedia(html, source) {
  const imgRegex = /https:\/\/pbs\.twimg\.com\/media\/[A-Za-z0-9_-]+\.(jpg|png)/g;
  const imgMatches = [...new Set(html.match(imgRegex) || [])];
  const images = imgMatches.map(u => ({
    url: u + '?format=jpg&name=large',
    type: 'image',
  }));

  const gifThumbRegex = /https:\/\/pbs\.twimg\.com\/tweet_video_thumb\/[A-Za-z0-9_-]+\.(jpg|png)/g;
  const gifThumbMatches = [...new Set(html.match(gifThumbRegex) || [])];

  const gifMp4Regex = /https:\/\/video\.twimg\.com\/tweet_video\/[A-Za-z0-9_-]+\.mp4/g;
  const gifMp4Matches = [...new Set(html.match(gifMp4Regex) || [])];

  const gifs = gifMp4Matches.map(u => ({
    url: u,
    type: 'gif',
  }));

  gifThumbMatches.forEach(thumb => {
    const id = thumb.match(/tweet_video_thumb\/([A-Za-z0-9_-]+)\./)?.[1];
    if (id && !gifMp4Matches.some(m => m.includes(id))) {
      gifs.push({ url: thumb + '?format=jpg&name=large', type: 'gif_thumb' });
    }
  });

  const hashtagRegex = /#([A-Za-z가-힣0-9_]+)/g;
  const allHashtags = [...new Set((html.match(hashtagRegex) || []).map(h => h.replace('#', '')))];
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
