// Videos page: a masonry wall from CONFIG.VIDEOS. Each card matches its video's shape and shows its own first frame.
const TRI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>';

const videos = (cfg.VIDEOS || []).map((v) => {
  const id = youtubeId(v.youtube);
  if (id) return { yt: id, title: v.title || 'Video' };
  if (v.src) return { src: v.src, title: v.title || 'Video' };
  return null;
}).filter(Boolean);

renderHeader('videos');
const reel = $('reel');

if (!videos.length) {
  const yt = ((cfg.LINKS && cfg.LINKS.Social) || []).find((l) => /youtube/i.test(l.name));
  reel.innerHTML = `<p class="v-empty">No videos here yet. Add them to the VIDEOS list in js/config.js.${yt ? ` Meanwhile, watch on <a href="${esc(yt.url)}" target="_blank" rel="noopener">YouTube</a>.` : ''}</p>`;
  reel.style.columns = 'auto';
} else {
  // #t=0.1 makes the browser show a frame (not a black box) before playing, including on phones.
  reel.innerHTML = videos.map((v) => v.yt
    ? `<div class="vid ready"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?rel=0" title="${esc(v.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
    : `<div class="vid loading"><video src="${esc(encodeURI(v.src))}#t=0.1" preload="metadata" playsinline aria-label="${esc(v.title)}"></video><button class="pbtn" aria-label="Play video"><span>${TRI}</span></button></div>`
  ).join('');

  // Once a video knows its size, the card takes the same shape (limited to phone-tall or widescreen).
  const fit = (card, vid) => {
    if (!vid.videoWidth) return;
    const ar = Math.min(16 / 9, Math.max(9 / 16, vid.videoWidth / vid.videoHeight));
    card.style.setProperty('--ar', ar.toFixed(4));
    card.classList.remove('loading');
    card.classList.add('ready');
  };

  const pauseOthers = (except) => document.querySelectorAll('#reel video').forEach((el) => { if (el !== except) el.pause(); });
  const syncState = () => reel.classList.toggle('has-playing', !!reel.querySelector('.vid.playing'));

  reel.querySelectorAll('.vid').forEach((card) => {
    const vid = card.querySelector('video');
    if (!vid) return;
    const btn = card.querySelector('.pbtn');
    vid.addEventListener('loadedmetadata', () => fit(card, vid));
    if (vid.readyState >= 1) fit(card, vid);
    vid.addEventListener('error', () => { card.classList.remove('loading'); log('video failed to load:', vid.src); });
    vid.addEventListener('play', () => {
      pauseOthers(vid);
      vid.controls = true;               // native controls appear after the first play
      card.classList.add('playing');
      syncState();
    });
    const stop = () => { card.classList.remove('playing'); syncState(); };
    vid.addEventListener('pause', stop);
    vid.addEventListener('ended', stop);
    btn.addEventListener('click', () => vid.play());
  });

  // Cards rise in as they scroll into view, staggered when several arrive together.
  const show = (card, delay) => {
    card.style.transitionDelay = delay + 'ms';
    card.classList.add('in');
    setTimeout(() => { card.style.transitionDelay = ''; }, delay + 800);
  };
  const cards = [...reel.querySelectorAll('.vid')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, k) => { show(e.target, k * 80); io.unobserve(e.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    cards.forEach((c) => io.observe(c));
  } else cards.forEach((c) => c.classList.add('in'));
}
