// Videos page: one big player plus a reel of the rest, from CONFIG.VIDEOS. Click a clip to swap it in.
const TRI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>';

const videos = (cfg.VIDEOS || []).map((v) => {
  const id = youtubeId(v.youtube);
  if (id) return { title: v.title || 'Untitled', yt: id, poster: v.poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  if (v.src) return { title: v.title || 'Untitled', src: v.src, poster: v.poster || '' };
  return null;
}).filter(Boolean);

let current = -1;

function cover(v) {
  return v.poster ? `<img class="cover" src="${esc(v.poster)}" alt="">` : '<span class="cover"></span>';
}

// Show the cover with a play button. The player only loads after a click, so the page stays fast.
function select(i, autoplay) {
  current = i;
  const v = videos[i];
  $('now-title').textContent = v.title;
  $('screen').innerHTML = `${cover(v)}<button class="go" aria-label="Play ${esc(v.title)}"><span class="play">${TRI}</span></button>`;
  $('screen').querySelector('.go').onclick = () => play(i);
  document.querySelectorAll('.clip').forEach((c, n) => {
    c.classList.toggle('on', n === i);
    c.setAttribute('aria-current', n === i ? 'true' : 'false');
  });
  if (autoplay) play(i);
}

function play(i) {
  const v = videos[i];
  $('screen').innerHTML = v.yt
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
    : `<video src="${esc(v.src)}" poster="${esc(v.poster)}" controls autoplay playsinline></video>`;
}

renderHeader('videos');
if (!videos.length) {
  const yt = ((cfg.LINKS && cfg.LINKS.Social) || []).find((l) => /youtube/i.test(l.name));
  $('reel').innerHTML = `<p class="v-empty">No videos here yet. Add them to the VIDEOS list in js/config.js.${yt ? ` Meanwhile, watch on <a href="${esc(yt.url)}" target="_blank" rel="noopener">YouTube</a>.` : ''}</p>`;
} else {
  $('feature').hidden = false;
  $('reel').innerHTML = videos.map((v, i) =>
    `<button class="clip" data-i="${i}"><span class="thumb">${v.poster ? `<img src="${esc(v.poster)}" alt="" loading="lazy">` : ''}<span class="tri">${TRI}</span></span><span class="t">${esc(v.title)}</span></button>`
  ).join('');
  $('reel').addEventListener('click', (e) => {
    const b = e.target.closest('.clip');
    if (!b) return;
    select(+b.dataset.i, true);
    $('feature').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  select(0, false);
}