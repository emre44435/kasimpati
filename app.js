/* The original 3D film, without player chrome or on-screen sound controls. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('experience'), video = $('bloom'), music = $('music');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const normalRate = .88;
  let state = 'intro', usingLite = false, unavailable = false;
  let qualityChecked = false, playAttempt = 0, watchdog = 0;
  let resumeVideo = false, resumeMusic = false;

  function playMusic() {
    music.volume = .64;
    const attempt = music.play();
    if (attempt) attempt.catch(() => { /* Device audio policy must be respected. */ });
  }

  function showLetter() {
    if (state === 'letter') return;
    clearTimeout(watchdog);
    playAttempt++;
    state = 'letter';
    video.pause();
    $('garden').hidden = true;
    $('letter').hidden = false;
    app.dataset.state = state;
    window.scrollTo({top: 0, behavior: 'instant'});
    $('letter-title').focus({preventScroll: true});
    $('announcement').textContent = 'Kasımpatı açıldı. Kasımpatılar en serin günlerde bile açar.';
  }

  function restoreInvitation() {
    if (state !== 'blooming') return;
    clearTimeout(watchdog);
    state = 'intro';
    app.dataset.state = state;
    $('intro-copy').hidden = false;
    $('invitation').hidden = false;
    $('begin').disabled = false;
    music.pause();
    $('announcement').textContent = 'Başlatmak için düğmeye yeniden dokunabilirsin.';
    $('begin').focus({preventScroll: true});
  }

  function playVideo() {
    const id = ++playAttempt;
    const attempt = video.play();
    if (attempt) attempt.then(() => {
      if (id !== playAttempt) return;
      if (state !== 'blooming' || document.hidden) { video.pause(); return; }
      app.classList.add('has-motion');
    }).catch(error => {
      if (id !== playAttempt || state !== 'blooming' || document.hidden) return;
      if (error.name === 'NotAllowedError') restoreInvitation();
      else if (!usingLite) useLite(video.currentTime || 0, true);
      else showLetter();
    });
  }

  function useLite(time = 0, continuePlaying = false) {
    usingLite = true;
    playAttempt++;
    video.pause();
    $('bloom-source').src = 'assets/bloom-lite.mp4';
    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Math.min(time, Math.max(0, video.duration - .08));
      video.playbackRate = normalRate;
      if (continuePlaying && state === 'blooming' && !document.hidden) playVideo();
    }, {once: true});
    video.load();
  }

  function start() {
    if (state !== 'intro') return;
    // Both play requests originate in this user gesture, including on mobile.
    playMusic();
    state = 'blooming';
    app.dataset.state = state;
    $('begin').disabled = true;
    $('intro-copy').hidden = true;
    $('invitation').hidden = true;
    $('garden').focus({preventScroll: true});
    $('announcement').textContent = 'Kasımpatı senin için açılıyor.';
    if (motion.matches || unavailable) { showLetter(); return; }
    video.playbackRate = normalRate;
    playVideo();
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (state !== 'blooming' || document.hidden || video.currentTime >= .1) return;
      if (!usingLite) useLite(0, true);
      else showLetter();
    }, 15000);
  }

  function replay() {
    playAttempt++; clearTimeout(watchdog);
    video.pause(); music.pause();
    if (video.readyState) video.currentTime = 0;
    music.currentTime = 0;
    resumeVideo = false; resumeMusic = false;
    state = 'intro';
    app.dataset.state = state;
    app.classList.remove('has-motion');
    $('letter').hidden = true;
    $('garden').hidden = false;
    $('intro-copy').hidden = false;
    $('invitation').hidden = false;
    $('begin').disabled = false;
    window.scrollTo({top: 0, behavior: 'instant'});
    start();
  }

  $('again').addEventListener('click', replay);
  $('begin').addEventListener('click', start);
  video.addEventListener('playing', () => {
    if (state === 'blooming') app.classList.add('has-motion');
  });
  video.addEventListener('ended', showLetter);
  video.addEventListener('timeupdate', () => {
    if (qualityChecked || usingLite || video.currentTime < 3 || !video.getVideoPlaybackQuality) return;
    const quality = video.getVideoPlaybackQuality();
    if (quality.totalVideoFrames < 25) return;
    qualityChecked = true;
    if (quality.droppedVideoFrames / quality.totalVideoFrames > .17) useLite(video.currentTime, state === 'blooming');
  });
  video.addEventListener('error', () => {
    if (!usingLite) useLite(video.currentTime || 0, state === 'blooming');
    else {
      unavailable = true;
      if (state === 'blooming') showLetter();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeVideo = state === 'blooming' && !video.paused;
      resumeMusic = !music.paused;
      playAttempt++;
      video.pause(); music.pause();
    } else {
      if (resumeVideo && state === 'blooming') playVideo();
      if (resumeMusic) playMusic();
      resumeVideo = false; resumeMusic = false;
    }
  });
  motion.addEventListener?.('change', () => {
    if (motion.matches && state === 'blooming') showLetter();
  });
  window.addEventListener('pagehide', () => {
    playAttempt++; clearTimeout(watchdog); video.pause(); music.pause();
  });
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 3)) useLite();
})();
