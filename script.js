/* =========================================================
   Ives Lin — Portfolio  ·  v4
   Loader · Cursor · Modal · Tabs · Parallax · Nav · Fade
   ========================================================= */

(() => {
  'use strict';

  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0. 背景網格 — 滾動視差 ---------- */
  const bgGrid = document.querySelector('.bg-grid');
  const bgParallaxEls = document.querySelectorAll('[data-parallax-bg]');
  const updateBgParallax = () => {
    if (reducedMotion) return;
    const y = window.scrollY;
    bgParallaxEls.forEach((el) => {
      const rate = parseFloat(el.dataset.parallaxBg) || 0.15;
      el.style.transform = `translate3d(0, ${-y * rate}px, 0)`;
    });
    // 滑鼠輕微視差也讓 grid 移動少許 — 在 mousemove 監聽器另外處理
  };
  window.addEventListener('scroll', () => requestAnimationFrame(updateBgParallax), { passive: true });

  // 滑鼠位置驅動的網格微移動（桌機）
  if (bgGrid && isFinePointer && !reducedMotion) {
    let raf = null;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 24;   // 最多 ±12px
      my = (e.clientY / window.innerHeight - 0.5) * 24;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const rate = parseFloat(bgGrid.dataset.parallaxBg) || 0.15;
        bgGrid.style.transform =
          `translate3d(${mx}px, ${-y * rate + my}px, 0)`;
      });
    });
  }

  /* ---------- 0b. SPLASH 鎖捲動 + 進入按鈕 ---------- */
  const enterBtn = document.querySelector('[data-enter]');

  // 開始即鎖捲動
  document.documentElement.classList.add('splash-active');

  const enterPortfolio = () => {
    document.documentElement.classList.remove('splash-active');
    document.body.classList.add('is-entered');
    // 解鎖後再 smooth scroll
    requestAnimationFrame(() => {
      const target = document.getElementById('about') || document.querySelector('.hero');
      if (target) {
        const offset = 60;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      enterPortfolio();
    });
  }

  /* ---------- 1. LOADER ---------- */
  const loader = document.querySelector('.loader');
  const finishLoading = () => {
    if (!loader) return;
    loader.classList.add('is-out');
    document.body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 1200);
  };
  const minDelay = 1400;
  const start = performance.now();
  window.addEventListener('load', () => {
    const elapsed = performance.now() - start;
    setTimeout(finishLoading, Math.max(0, minDelay - elapsed));
  });
  setTimeout(finishLoading, 4000);

  /* ---------- 2. NAV — scroll state + mobile toggle ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');

  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    updateParallax();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /* ---------- 3. SCROLL PARALLAX ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const parallaxData = [];
  parallaxEls.forEach((el) => {
    parallaxData.push({
      el,
      rate: parseFloat(el.dataset.parallax) || 0,
    });
  });

  let parallaxRaf = null;
  const updateParallax = () => {
    if (reducedMotion) return;
    // 手機版不做元素層級 parallax — 避免肖像蓋住文字
    const isMobileNow = window.matchMedia('(max-width: 900px)').matches;
    if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
    parallaxRaf = requestAnimationFrame(() => {
      const y = window.scrollY;
      parallaxData.forEach(({ el, rate }) => {
        if (isMobileNow) {
          el.style.transform = '';
        } else {
          const offset = y * rate;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
    });
  };
  updateParallax();

  /* ---------- 4. SCROLL FADE-IN ---------- */
  const fadeEls = document.querySelectorAll('[data-fade]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            const siblings = parent ? [...parent.querySelectorAll('[data-fade]')] : [];
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 5. SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- 6. CURSOR ---------- */
  const cursorRing = document.querySelector('.cursor:not(.cursor--dot)');
  const cursorDot = document.querySelector('.cursor--dot');

  if (isFinePointer && cursorRing && cursorDot) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    const lerp = (a, b, t) => a + (b - a) * t;

    const cursorLoop = () => {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      cursorDot.style.transform  = `translate3d(${mx}px, ${my}px, 0)`;
      requestAnimationFrame(cursorLoop);
    };

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!cursorRing.classList.contains('is-ready')) {
        cursorRing.classList.add('is-ready');
        cursorDot.classList.add('is-ready');
      }
    });
    document.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('is-ready');
      cursorDot.classList.remove('is-ready');
    });
    document.addEventListener('mouseenter', () => {
      cursorRing.classList.add('is-ready');
      cursorDot.classList.add('is-ready');
    });

    const setHoverListeners = (root = document) => {
      const sel = 'a, button, [data-magnetic], .case__link, .play__card, .skill, .work-tab, .resume-item, .tools__list li, .clients__list li';
      root.querySelectorAll(sel).forEach((el) => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => {
          cursorRing.classList.add('is-hover');
          cursorDot.classList.add('is-hover');
        });
        el.addEventListener('mouseleave', () => {
          cursorRing.classList.remove('is-hover');
          cursorDot.classList.remove('is-hover');
        });
      });
    };
    setHoverListeners();

    requestAnimationFrame(cursorLoop);
  }

  /* ---------- 7. WORK TABS — category filter ---------- */
  const tabs = document.querySelectorAll('.work-tab');
  const cases = document.querySelector('.cases');
  const emptyEl = document.querySelector('[data-empty]');

  const updateEmpty = () => {
    if (!cases || !emptyEl) return;
    const cat = cases.dataset.activeCategory;
    if (cat === 'all') { emptyEl.hidden = true; return; }
    const visible = cases.querySelectorAll(`.case[data-category="${cat}"]`);
    emptyEl.hidden = visible.length > 0;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      if (tab.classList.contains('is-active')) return;
      tabs.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const cat = tab.dataset.tab;

      if (!cases) return;
      cases.classList.add('is-switching');
      setTimeout(() => {
        cases.dataset.activeCategory = cat;
        updateEmpty();
        cases.classList.remove('is-switching');
      }, 220);
    });
  });

  /* ---------- 8. MODAL ---------- */
  const modal = document.getElementById('modal');
  const modalCases = modal ? modal.querySelectorAll('.modal__case') : [];
  const modalScroll = modal ? modal.querySelector('.modal__scroll') : null;
  let lastFocused = null;

  const openModal = (caseId) => {
    if (!modal) return;
    modalCases.forEach((c) => {
      c.hidden = c.dataset.case !== caseId;
    });
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalScroll) modalScroll.scrollTop = 0;
    const panel = modal.querySelector('.modal__panel');
    if (panel) panel.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  document.querySelectorAll('.case__link[data-case]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(link.dataset.case);
    });
  });
  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ---------- 8b. LIGHTBOX — 點擊圖片/影片放大 ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  const lbVideo = lightbox ? lightbox.querySelector('.lightbox__video') : null;
  const lbCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;
  const lbCounter = lightbox ? lightbox.querySelector('.lightbox__counter') : null;
  const lbPrev = lightbox ? lightbox.querySelector('.lightbox__prev') : null;
  const lbNext = lightbox ? lightbox.querySelector('.lightbox__next') : null;

  let lbItems = [];   // 當前 modal 內所有可放大的項目
  let lbIndex = 0;

  // 從一個 zoom 元素抽出 src / type / caption
  const extractZoomData = (el) => {
    let src = el.dataset.zoomSrc || '';
    const type = el.dataset.zoomType || 'image';
    const caption = el.dataset.caption || el.querySelector('img')?.alt || '';
    // 若元素內有 <img>，優先用那張；放大時優先用 data-zoom-src（高解析）否則用 img.src
    const innerImg = el.querySelector('img');
    if (!src && innerImg) src = innerImg.src;
    // video src
    const innerVideo = el.querySelector('video source');
    if (!src && innerVideo) src = innerVideo.src;
    return { src, type, caption };
  };

  const showLightboxItem = (i) => {
    if (!lightbox || lbItems.length === 0) return;
    lbIndex = (i + lbItems.length) % lbItems.length;
    const data = extractZoomData(lbItems[lbIndex]);
    if (!data.src) {
      // 沒實際 src — 顯示提示佔位
      lbImg.src = '';
      lbImg.alt = '尚未放置圖片';
      lbImg.hidden = true;
      lbVideo.hidden = true;
      lbCaption.textContent = data.caption + '（尚未放置圖片）';
    } else if (data.type === 'video') {
      lbImg.hidden = true;
      lbVideo.src = data.src;
      lbVideo.hidden = false;
      lbCaption.textContent = data.caption;
    } else {
      lbVideo.pause?.();
      lbVideo.src = '';
      lbVideo.hidden = true;
      lbImg.src = data.src;
      lbImg.alt = data.caption;
      lbImg.hidden = false;
      lbCaption.textContent = data.caption;
    }
    if (lbCounter) {
      lbCounter.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
    }
    if (lbPrev && lbNext) {
      const single = lbItems.length <= 1;
      lbPrev.hidden = single;
      lbNext.hidden = single;
    }
  };

  const openLightbox = (clickedEl) => {
    if (!lightbox) return;
    // 找出當前所在 case 的所有可放大元素
    const activeCase = clickedEl.closest('.modal__case');
    if (activeCase) {
      lbItems = Array.from(activeCase.querySelectorAll('[data-zoom]'));
    } else {
      lbItems = [clickedEl];
    }
    const idx = lbItems.indexOf(clickedEl);
    showLightboxItem(idx >= 0 ? idx : 0);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbVideo) { lbVideo.pause?.(); lbVideo.src = ''; }
    if (lbImg) lbImg.src = '';
  };

  // 為所有 [data-zoom] 註冊 click
  document.querySelectorAll('[data-zoom]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(el);
    });
  });

  // 上一張 / 下一張
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightboxItem(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightboxItem(lbIndex + 1); });

  // 點背景關閉
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) {
        closeLightbox();
      }
    });
    lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => {
      el.addEventListener('click', closeLightbox);
    });
  }

  // 鍵盤：ESC 關閉、左右切換
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxItem(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightboxItem(lbIndex + 1);
  });

  /* ---------- 9. SUBTLE HERO POINTER PARALLAX ---------- */
  const hero = document.querySelector('.hero');
  const heroLede = document.querySelector('.hero__lede');
  const heroPortrait = document.querySelector('.hero__portrait-frame');

  if (hero && isFinePointer && heroLede) {
    let raf = null;
    hero.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        heroLede.style.transform = `translate3d(${x * 4}px, ${y * 3}px, 0)`;
        if (heroPortrait) {
          heroPortrait.style.transform = `translate3d(${x * -8}px, ${y * -6}px, 0)`;
        }
      });
    });
    hero.addEventListener('mouseleave', () => {
      heroLede.style.transform = '';
      if (heroPortrait) heroPortrait.style.transform = '';
    });
    heroLede.style.transition = 'transform 0.8s cubic-bezier(.16,1,.3,1)';
    if (heroPortrait) heroPortrait.style.transition = 'transform 0.9s cubic-bezier(.16,1,.3,1)';
  }

  /* ---------- 10. CASE MEDIA SUBTLE TILT ---------- */
  document.querySelectorAll('.case__link').forEach((card) => {
    const media = card.querySelector('.case__media');
    if (!media || !isFinePointer) return;
    card.addEventListener('mousemove', (e) => {
      const r = media.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      media.style.transform = `translateY(-4px) rotateX(${y * -2.5}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => { media.style.transform = ''; });
    media.style.transformStyle = 'preserve-3d';
    media.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
  });
})();
