/* BLOOM — self-contained, gesture-controlled 3D flower experience. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('experience'), garden = $('garden'), letter = $('letter');
  const video = $('bloom'), music = $('music'), timeline = $('timeline');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const normalRate = .88;
  let state = 'intro', soundEnabled = true, started = false;
  let raf = 0, watchdog = 0, holdTimer = 0, held = false, scrubbing = false;
  let scrubWasPlaying = false, resumeVideo = false, resumeMusic = false;
  let generation = 0, usingLite = false, qualityChecked = false;

  function soundUI() {
    const playing = !music.paused && !music.ended && soundEnabled;
    app.dataset.sound = playing ? 'on' : 'off';
    $('sound-label').textContent = !started ? (soundEnabled ? 'Müzikle' : 'Sessiz') : playing ? 'Ses açık' : 'Sesi aç';
    $('sound').setAttribute('aria-pressed', String(soundEnabled));
    $('sound').setAttribute('aria-label', soundEnabled && (!started || playing) ? 'Müziği kapat' : 'Müziği aç');
  }
  function playMusic(reset = false) {
    if (!soundEnabled) return;
    if (reset || music.ended) music.currentTime = 0;
    music.volume = .64;
    const result = music.play();
    if (result) result.catch(() => { soundEnabled = false; soundUI(); });
  }
  function setState(next) {
    state = next;
    app.dataset.state = next;
    $('play-controls').hidden = next !== 'blooming' && next !== 'paused';
    $('begin').tabIndex = next === 'intro' ? 0 : -1;
    $('intro-copy').setAttribute('aria-hidden', String(next !== 'intro'));
    const paused = next === 'paused';
    $('pause-label').textContent = paused ? 'Devam et' : 'Biraz kal';
    $('pause').setAttribute('aria-label', paused ? 'Çiçeğin açılışına devam et' : 'Çiçeğin açılışını duraklat');
    $('pause-path').setAttribute('d', paused ? 'M7 4l8 6-8 6Z' : 'M7 5v10M13 5v10');
    $('flower-touch').setAttribute('aria-label', next === 'intro' ? 'Dokun, kasımpatı senin için açılsın' : paused ? 'Açılışa devam et' : 'Açılışı duraklat; basılı tutarak yavaşlat');
    $('progress-word').textContent = paused ? 'BU ANDA KAL' : 'AÇILIYOR';
    $('chapter-label').textContent = next === 'intro' ? '01 — BEKLEYİŞ' : '02 — AÇILIŞ';
  }
  function notice(message = '') {
    $('media-notice').textContent = message;
    $('media-notice').hidden = !message;
  }
  function progress() {
    const fraction = Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration : 0;
    if (!scrubbing) timeline.value = Math.round(fraction * 1000);
    timeline.style.setProperty('--progress', `${fraction * 100}%`);
    app.style.setProperty('--bloom', fraction.toFixed(4));
    timeline.setAttribute('aria-valuetext', `Yüzde ${Math.round(fraction * 100)} açıldı`);
  }
  function stopClock() { cancelAnimationFrame(raf); raf = 0; }
  function clock() {
    progress();
    if (state === 'blooming' && !video.paused) {
      checkQuality();
      raf = requestAnimationFrame(clock);
    }
  }
  function beginClock() { stopClock(); raf = requestAnimationFrame(clock); }
  function useLite(time = 0, continuePlaying = false) {
    usingLite = true;
    video.pause();
    $('bloom-source').src = 'assets/bloom-lite.mp4';
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(time, Math.max(0, video.duration - .08));
      video.playbackRate = normalRate;
      if (continuePlaying && state === 'blooming') playVideo();
    }, { once: true });
    video.load();
  }
  function checkQuality() {
    if (qualityChecked || usingLite || video.currentTime < 3 || !video.getVideoPlaybackQuality) return;
    const q = video.getVideoPlaybackQuality();
    if (q.totalVideoFrames < 25) return;
    qualityChecked = true;
    if (q.droppedVideoFrames / q.totalVideoFrames > .17) useLite(video.currentTime, true);
  }
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 3)) useLite();

  function showLetter() {
    generation++;
    clearTimeout(watchdog); clearTimeout(holdTimer); stopClock();
    video.pause(); scrubbing = false; held = false;
    garden.hidden = true; letter.hidden = false;
    setState('letter');
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('letter-title').focus({ preventScroll: true });
    $('announcement').textContent = 'Kasımpatı açıldı. Senin için bir not: İyi ki varsın.';
  }
  function playVideo() {
    const current = ++generation;
    const result = video.play();
    if (result) result.then(() => {
      if (current !== generation || state === 'letter' || state === 'intro') { video.pause(); return; }
      app.classList.add('is-using-video');
      notice(); beginClock();
    }).catch(() => {
      if (current !== generation) return;
      setState('paused');
      notice('Açılışa devam etmek için çiçeğe yeniden dokunabilirsin.');
    });
  }
  function start() {
    if (state !== 'intro') return;
    started = true;
    playMusic(); soundUI();
    if (reducedMotion.matches) { showLetter(); return; }
    notice(); setState('blooming');
    video.playbackRate = normalRate;
    playVideo();
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (state !== 'letter' && video.currentTime < .1) {
        video.pause(); stopClock(); setState('paused');
        notice('Çiçeğe dokunarak yeniden deneyebilir ya da mesajını açabilirsin.');
      }
    }, 14000);
  }
  function togglePause() {
    if (state === 'intro') { start(); return; }
    if (state === 'letter') return;
    clearTimeout(holdTimer);
    if (state === 'blooming') {
      generation++; video.pause(); stopClock(); setState('paused');
    } else {
      setState('blooming'); video.playbackRate = normalRate; playVideo();
    }
  }
  function reset() {
    generation++; clearTimeout(watchdog); clearTimeout(holdTimer); stopClock();
    video.pause(); music.pause();
    if (video.readyState) video.currentTime = 0;
    music.currentTime = 0;
    scrubbing = false; held = false; started = false;
    resumeVideo = false; resumeMusic = false;
    letter.hidden = true; garden.hidden = false;
    app.classList.remove('is-using-video');
    $('share-status').textContent = '';
    $('announcement').textContent = '';
    notice(); setState('intro'); progress(); soundUI();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  $('begin').addEventListener('click', start);
  $('pause').addEventListener('click', togglePause);
  $('flower-touch').addEventListener('click', () => {
    if (held) { held = false; return; }
    togglePause();
  });
  $('flower-touch').addEventListener('pointerdown', () => {
    held = false;
    if (state !== 'blooming') return;
    holdTimer = setTimeout(() => {
      held = true; video.playbackRate = .32;
      $('progress-word').textContent = 'YAVAŞÇA';
    }, 420);
  });
  function releaseHold() {
    clearTimeout(holdTimer);
    video.playbackRate = normalRate;
    if (state === 'blooming') $('progress-word').textContent = 'AÇILIYOR';
  }
  window.addEventListener('pointerup', releaseHold);
  window.addEventListener('pointercancel', () => { releaseHold(); held = false; });
  function beginScrub() {
    if (state === 'intro' || state === 'letter' || scrubbing) return;
    scrubbing = true; scrubWasPlaying = state === 'blooming';
    generation++; video.pause(); stopClock();
  }
  function finishScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    if (Number(timeline.value) > 990) { showLetter(); return; }
    if (scrubWasPlaying) { setState('blooming'); playVideo(); }
    else setState('paused');
  }
  timeline.addEventListener('pointerdown', beginScrub);
  timeline.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) beginScrub();
  });
  timeline.addEventListener('input', () => {
    beginScrub();
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(Number(timeline.value) / 1000 * video.duration, video.duration - .04);
      timeline.style.setProperty('--progress', `${Number(timeline.value) / 10}%`);
      timeline.setAttribute('aria-valuetext', `Yüzde ${Math.round(Number(timeline.value) / 10)} açıldı`);
      app.style.setProperty('--bloom', Number(timeline.value) / 1000);
      app.classList.add('is-using-video');
    }
  });
  timeline.addEventListener('change', finishScrub);
  timeline.addEventListener('keyup', finishScrub);
  window.addEventListener('pointerup', () => { if (scrubbing) finishScrub(); });
  video.addEventListener('ended', showLetter);
  video.addEventListener('timeupdate', progress);
  video.addEventListener('playing', () => {
    if (state === 'blooming') { app.classList.add('is-using-video'); beginClock(); }
  });
  video.addEventListener('error', () => {
    if (!usingLite) { useLite(video.currentTime || 0, state === 'blooming'); return; }
    if (state !== 'letter') {
      stopClock(); setState('paused');
      notice('Açılış yüklenemedi. “Mesajı oku” ile sürprizine ulaşabilirsin.');
    }
  });
  $('read-now').addEventListener('click', () => { started = true; playMusic(); showLetter(); soundUI(); });
  $('again').addEventListener('click', () => { reset(); start(); });
  $('home').addEventListener('click', event => { event.preventDefault(); reset(); $('begin').focus({ preventScroll: true }); });
  $('sound').addEventListener('click', () => {
    if (!started) { soundEnabled = !soundEnabled; soundUI(); return; }
    if (!music.paused && !music.ended && soundEnabled) { soundEnabled = false; music.pause(); }
    else { soundEnabled = true; playMusic(); }
    soundUI();
  });
  ['play', 'pause', 'ended', 'error'].forEach(event => music.addEventListener(event, soundUI));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeVideo = state === 'blooming' && !video.paused;
      resumeMusic = !music.paused;
      generation++; video.pause(); music.pause(); stopClock();
    } else {
      if (resumeVideo && state === 'blooming') playVideo();
      if (resumeMusic && soundEnabled) playMusic();
      resumeVideo = false; resumeMusic = false;
    }
  });
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches && (state === 'blooming' || state === 'paused')) showLetter();
  });
  $('share').addEventListener('click', async () => {
    const feedback = $('share-status');
    if (!/^https?:$/.test(location.protocol)) { feedback.textContent = 'Paylaşmak için önce GitHub Pages bağlantını aç.'; return; }
    const url = new URL(location.href); url.hash = '';
    try {
      if (navigator.share) await navigator.share({ title: 'Senin için açan bir kasımpatı', text: 'Bu çiçek, bugün gülümsemen için.', url: url.href });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url.href); feedback.textContent = 'Bağlantı kopyalandı.'; }
      else feedback.textContent = url.href;
    } catch (error) {
      if (error.name !== 'AbortError') feedback.textContent = 'Bağlantıyı tarayıcının adres çubuğundan kopyalayabilirsin.';
    }
  });
  $('credits-open').addEventListener('click', () => $('credits').showModal());
  $('credits-close').addEventListener('click', () => $('credits').close());
  $('credits').addEventListener('click', event => { if (event.target === $('credits')) $('credits').close(); });
  $('credits').addEventListener('close', () => $('credits-open').focus({ preventScroll: true }));
  window.addEventListener('pagehide', () => { generation++; video.pause(); music.pause(); stopClock(); });
  setState('intro'); soundUI(); progress();
})();
