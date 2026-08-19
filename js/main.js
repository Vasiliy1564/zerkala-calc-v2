/* ============================================================
   ЗЕРКАЛА ПРО — дизайн ARCO
   Интерактив + полный калькулятор (алгоритм идентичен исходному)
   ============================================================ */
(function () {
  'use strict';

  var PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700">' +
    '<rect width="100%" height="100%" fill="#f3f2ef"/>' +
    '<rect x="50%" y="42%" width="120" height="60" transform="translate(-60,-30)" fill="none" stroke="#c4c0b8" stroke-width="2"/>' +
    '<text x="50%" y="60%" font-family="Georgia,serif" font-size="20" letter-spacing="5" fill="#8f8d88" text-anchor="middle">ЗЕРКАЛА ПРО</text>' +
    '</svg>'
  );

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var MAX_URL = 'https://max.ru/u/f9LHodD0cOJCsHfbfog1RuUGjeMCEw_wI5D3w-uzWYe4wj6KqPXR9YOSHA8';

  /* ---------- Fallback для битых картинок ---------- */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallback) {
      t.dataset.fallback = '1';
      t.src = PLACEHOLDER;
    }
  }, true);

  /* ---------- Год в подвале ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Мобильное меню ---------- */
  var menuButton = $('.menu-button'),
      menu = $('#site-menu');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $all('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Фильтры галереи ---------- */
  var filters = $all('.filter'),
      projects = $all('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      projects.forEach(function (card) {
        card.hidden = f !== 'all' && card.dataset.category.indexOf(f) === -1;
      });
    });
  });

  /* ---------- Лайтбокс ---------- */
  var lightbox = $('#lightbox');
  if (lightbox) {
    var lightboxImage = $('img', lightbox),
        lightboxCaption = $('.lightbox-caption', lightbox);
    projects.forEach(function (card) {
      card.addEventListener('click', function () {
        var image = $('img', card);
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = card.dataset.caption || '';
        lightbox.classList.add('open');
        document.body.classList.add('no-scroll');
      });
    });
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
    $('.lightbox-close', lightbox).addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- Маска телефона ---------- */
  function maskPhone(input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').replace(/^[78]/, '');
      d = d.slice(0, 10);
      var out = '+7';
      if (d.length > 0) out += ' (' + d.slice(0, 3);
      if (d.length >= 3) out += ') ' + d.slice(3, 6);
      if (d.length >= 6) out += '-' + d.slice(6, 8);
      if (d.length >= 8) out += '-' + d.slice(8, 10);
      input.value = out;
    });
  }
  $all('input[type="tel"]').forEach(maskPhone);

  /* ---------- Форма в контактах ---------- */
  var contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#quick-name', contactForm).value.trim();
      var phone = $('#quick-phone', contactForm).value.trim();
      var msg = $('#quick-message', contactForm).value.trim();
      if (!name || !phone) {
        $('#quick-name', contactForm).focus();
        return;
      }
      var text = 'Здравствуйте! Меня зовут ' + name + '. Телефон: ' + phone + '.';
      if (msg) text += ' Пожелания: ' + msg;
      text += ' Хочу заказать зеркало.';
      window.open(MAX_URL + '?text=' + encodeURIComponent(text), '_blank');
      var button = $('button', contactForm);
      button.textContent = 'Спасибо, заявка открыта в MAX';
      button.disabled = true;
    });
  }

  /* ============================================================
     КАЛЬКУЛЯТОР — порт исходного алгоритма (идентичные результаты)
     ============================================================ */
  var state = {
    shape: 'rect',
    light: true,
    ctrl: 'wave',
    clr: 'warm',
    facet: 'none',
    film: false,
    heat: false,
    install: false
  };

  var SHAPE_NAMES = {
    rect: 'Прямоугольник',
    circle: 'Круг',
    oval: 'Овал',
    semicircle: 'Полукруг',
    double: 'Из двух частей',
    semidouble: 'Полукруг из двух частей'
  };

  var VB_W = 170, VB_H = 240, PAD = 10;
  var AVAIL_W = VB_W - PAD * 2;
  var AVAIL_H = VB_H - PAD * 2;

  function roundUp500(n) { return Math.ceil(n / 500) * 500; }
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }

  function readState() {
    var s = $('input[name="shape"]:checked');
    if (s) state.shape = s.value;
    var l = $('input[name="light"]:checked');
    if (l) state.light = l.value === 'on';
    var c = $('input[name="ctrl"]:checked');
    if (c) state.ctrl = c.value;
    var cl = $('input[name="clr"]:checked');
    if (cl) state.clr = cl.value;
    var f = $('input[name="facet"]:checked');
    if (f) state.facet = f.value;
    function opt(v) {
      var o = $('input[name="option"][value="' + v + '"]');
      return !!(o && o.checked);
    }
    state.film = opt('film');
    state.heat = opt('heat');
    state.install = opt('install');
  }

  function adj(id, delta) {
    var el = document.getElementById(id);
    if (!el) return;
    var v = parseInt(el.value, 10) || 0;
    v = Math.max(40, v + delta);
    if (id === 'width') v = Math.min(v, 3210);
    if (id === 'height' || id === 'height2') v = Math.min(v, 2250);
    el.value = v;
    if (state.shape === 'circle') {
      var hEl = document.getElementById('height');
      if (hEl) hEl.value = v;
    }
    onSizeInput();
  }

  function onSizeInput() {
    readState();
    var hEl = document.getElementById('height');
    var wEl = document.getElementById('width');
    if (!hEl || !wEl) return;
    if (state.shape === 'circle') hEl.value = wEl.value;
    var rowH2 = document.getElementById('rowH2');
    if (rowH2) rowH2.classList.toggle('hidden', state.shape !== 'double');
    updPreview();
  }

  function fitBox(aspect) {
    var bw, bh;
    if (aspect >= 1) {
      bw = AVAIL_W;
      bh = AVAIL_W / aspect;
      if (bh > AVAIL_H) { bh = AVAIL_H; bw = AVAIL_H * aspect; }
    } else {
      bh = AVAIL_H;
      bw = AVAIL_H * aspect;
      if (bw > AVAIL_W) { bw = AVAIL_W; bh = AVAIL_W / aspect; }
    }
    return { w: bw, h: bh };
  }

  function updPreview() {
    var wEl = document.getElementById('width');
    var hEl = document.getElementById('height');
    if (!wEl || !hEl) return;
    var w = parseFloat(wEl.value) || 150;
    var h = parseFloat(hEl.value) || 70;

    var lblW = document.getElementById('lblW');
    var lblH = document.getElementById('lblH');

    if (state.shape === 'circle') {
      if (lblW) lblW.textContent = 'Ø ' + w + ' см';
      if (lblH) lblH.textContent = '';
    } else if (state.shape === 'double') {
      var h2 = parseFloat(document.getElementById('height2').value) || 60;
      if (lblW) lblW.textContent = w + ' см';
      if (lblH) lblH.textContent = h + ' + ' + h2 + ' см';
    } else if (state.shape === 'semidouble') {
      if (lblW) lblW.textContent = w + ' см';
      if (lblH) lblH.textContent = h + ' см';
    } else {
      if (lblW) lblW.textContent = w + ' см';
      if (lblH) lblH.textContent = h + ' см';
    }

    var wrap = document.getElementById('mirrorWrap');
    if (!wrap) return;
    var maxWrapW = 260, minWrapW = 100, maxWrapH = 320, minWrapH = 100;

    var aspect;
    if (state.shape === 'circle') {
      aspect = 1;
    } else {
      aspect = w / h;
    }

    var newW, newH;
    if (aspect >= 1) {
      newW = Math.min(maxWrapW, Math.max(minWrapW, 200 * Math.min(aspect, 1.8)));
      newH = Math.min(maxWrapH, Math.max(minWrapH, newW / aspect));
    } else {
      newH = Math.min(maxWrapH, Math.max(minWrapH, 200 * Math.min(1 / aspect, 1.8)));
      newW = Math.min(maxWrapW, Math.max(minWrapW, newH * aspect));
    }

    wrap.style.width = newW + 'px';
    wrap.style.height = newH + 'px';

    renderMirrorSvg();
  }

  function renderMirrorSvg() {
    var svg = document.getElementById('mirrorSvg');
    if (!svg) return;
    var wEl = document.getElementById('width');
    var hEl = document.getElementById('height');
    if (!wEl || !hEl) return;
    var w = parseFloat(wEl.value) || 150;
    var h = parseFloat(hEl.value) || 70;
    var shape = state.shape;
    var hasLight = state.light;
    var clr = state.clr;
    var facet = state.facet;

    var colors = { warm: '#ffb347', cold: '#4facfe', neutral: '#e0e0e0' };
    var glowColor = colors[clr] || '#00d9a3';
    var facetW = { none: 0, 10: 3, 20: 6, 25: 8 }[facet] || 0;

    var cx = VB_W / 2;
    var cy = VB_H / 2;
    var content = '';

    function logoText(bx, by, bw, bh) {
      var fs = Math.max(3.5, Math.min(6.5, bh * 0.05));
      return '<text x="' + (bx + bw - 6) + '" y="' + (by + bh - 7) + '" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="' + fs.toFixed(1) + '" font-weight="600" letter-spacing="0.12em" fill="rgba(255,255,255,0.72)" style="font-family:Arial, Helvetica, sans-serif">Mirror&nbsp;Pro</text>';
    }

    if (shape === 'rect') {
      var aspect = w / h;
      var fit = fitBox(aspect);
      var rw = fit.w, rh = fit.h;
      var rx = 10 * (rw / 150);
      var x = (VB_W - rw) / 2;
      var y = (VB_H - rh) / 2;
      content = '<rect class="mirror-glow" x="' + (x - facetW) + '" y="' + (y - facetW) + '" width="' + (rw + facetW * 2) + '" height="' + (rh + facetW * 2) + '" rx="' + (rx + facetW) + '" fill="none" stroke="' + glowColor + '" stroke-width="' + (hasLight ? 6 : 0) + '" opacity="' + (hasLight ? 0.7 : 0) + '" filter="url(#ledGlow)" />' +
        '<rect class="mirror-frame" x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" rx="' + rx + '" fill="none" stroke="url(#bevelGrad)" stroke-width="' + facetW + '" />' +
        '<rect class="mirror-body" x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" rx="' + rx + '" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />' +
        '<rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="' + (rw * 0.3) + '" height="' + (rh * 0.3) + '" rx="4" fill="url(#windowGrad)" opacity="0.6" />' +
        '<rect x="' + (x + rw * 0.55) + '" y="' + (y + 15) + '" width="' + (rw * 0.25) + '" height="' + (rh * 0.25) + '" rx="3" fill="url(#windowGrad)" opacity="0.4" />' +
        '<polygon points="' + x + ',' + y + ' ' + (x + rw) + ',' + (y + rh) + ' ' + (x + rw) + ',' + (y + rh * 0.7) + ' ' + x + ',' + y + '" fill="url(#glareGrad)" />' +
        '<rect x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" rx="' + rx + '" fill="url(#cornerGlow)" />' +
        '<rect x="' + x + '" y="' + (y + rh * 0.6) + '" width="' + rw + '" height="' + (rh * 0.4) + '" rx="' + rx + '" fill="url(#floorGrad)" />' +
        logoText(x, y, rw, rh);
    } else if (shape === 'circle') {
      var fitC = fitBox(1);
      var r = Math.min(fitC.w, fitC.h) / 2;
      content = '<circle class="mirror-glow" cx="' + cx + '" cy="' + cy + '" r="' + (r + 4 + facetW) + '" fill="none" stroke="' + glowColor + '" stroke-width="' + (hasLight ? 6 : 0) + '" opacity="' + (hasLight ? 0.7 : 0) + '" filter="url(#ledGlow)" />' +
        '<circle class="mirror-frame" cx="' + cx + '" cy="' + cy + '" r="' + (r + facetW) + '" fill="none" stroke="url(#bevelGrad)" stroke-width="' + facetW + '" />' +
        '<circle class="mirror-body" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />' +
        '<circle cx="' + (cx - r * 0.2) + '" cy="' + (cy - r * 0.25) + '" r="' + (r * 0.3) + '" fill="url(#windowGrad)" opacity="0.5" />' +
        '<circle cx="' + (cx + r * 0.3) + '" cy="' + (cy - r * 0.15) + '" r="' + (r * 0.22) + '" fill="url(#windowGrad)" opacity="0.3" />' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + r + '" fill="url(#glareGrad)" opacity="0.8" />' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + r + '" fill="url(#cornerGlow)" />' +
        '<ellipse cx="' + cx + '" cy="' + (cy + r * 0.25) + '" rx="' + (r * 0.7) + '" ry="' + (r * 0.5) + '" fill="url(#floorGrad)" opacity="0.6" />' +
        logoText(cx - r, cy - r, r * 2, r * 2);
    } else if (shape === 'oval') {
      var fitO = fitBox(w / h);
      var rxo = fitO.w / 2;
      var ryo = fitO.h / 2;
      content = '<ellipse class="mirror-glow" cx="' + cx + '" cy="' + cy + '" rx="' + (rxo + 4 + facetW) + '" ry="' + (ryo + 4 + facetW) + '" fill="none" stroke="' + glowColor + '" stroke-width="' + (hasLight ? 6 : 0) + '" opacity="' + (hasLight ? 0.7 : 0) + '" filter="url(#ledGlow)" />' +
        '<ellipse class="mirror-frame" cx="' + cx + '" cy="' + cy + '" rx="' + (rxo + facetW) + '" ry="' + (ryo + facetW) + '" fill="none" stroke="url(#bevelGrad)" stroke-width="' + facetW + '" />' +
        '<ellipse class="mirror-body" cx="' + cx + '" cy="' + cy + '" rx="' + rxo + '" ry="' + ryo + '" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />' +
        '<ellipse cx="' + (cx - rxo * 0.2) + '" cy="' + (cy - ryo * 0.3) + '" rx="' + (rxo * 0.35) + '" ry="' + (ryo * 0.3) + '" fill="url(#windowGrad)" opacity="0.5" />' +
        '<ellipse cx="' + (cx + rxo * 0.3) + '" cy="' + (cy - ryo * 0.15) + '" rx="' + (rxo * 0.25) + '" ry="' + (ryo * 0.22) + '" fill="url(#windowGrad)" opacity="0.3" />' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rxo + '" ry="' + ryo + '" fill="url(#glareGrad)" opacity="0.8" />' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rxo + '" ry="' + ryo + '" fill="url(#cornerGlow)" />' +
        '<ellipse cx="' + cx + '" cy="' + (cy + ryo * 0.35) + '" rx="' + (rxo * 0.7) + '" ry="' + (ryo * 0.5) + '" fill="url(#floorGrad)" opacity="0.6" />' +
        logoText(cx - rxo, cy - ryo, rxo * 2, ryo * 2);
    } else if (shape === 'semicircle') {
      var fitS = fitBox(w / h);
      var boxW = fitS.w;
      var boxH = fitS.h;
      var boxX = (VB_W - boxW) / 2;
      var boxY = (VB_H - boxH) / 2;
      var rr = boxH / 2;
      var rectW = boxW - rr;
      if (rectW < 0) {
        rr = boxW;
        boxH = 2 * rr;
        boxY = (VB_H - boxH) / 2;
        rectW = 0;
      }
      var pathMain = 'M ' + (boxX + rr) + ' ' + boxY + ' A ' + rr + ' ' + rr + ' 0 0 0 ' + boxX + ' ' + (boxY + rr) + ' A ' + rr + ' ' + rr + ' 0 0 0 ' + (boxX + rr) + ' ' + (boxY + boxH) + ' L ' + (boxX + boxW) + ' ' + (boxY + boxH) + ' L ' + (boxX + boxW) + ' ' + boxY + ' Z';
      var pathGlow = 'M ' + (boxX + rr) + ' ' + (boxY - facetW) + ' A ' + (rr + facetW) + ' ' + (rr + facetW) + ' 0 0 0 ' + (boxX - facetW) + ' ' + (boxY + rr) + ' A ' + (rr + facetW) + ' ' + (rr + facetW) + ' 0 0 0 ' + (boxX + rr) + ' ' + (boxY + boxH + facetW) + ' L ' + (boxX + boxW + facetW) + ' ' + (boxY + boxH + facetW) + ' L ' + (boxX + boxW + facetW) + ' ' + (boxY - facetW) + ' Z';
      content = '<path class="mirror-glow" d="' + pathGlow + '" fill="none" stroke="' + glowColor + '" stroke-width="' + (hasLight ? 6 : 0) + '" opacity="' + (hasLight ? 0.7 : 0) + '" filter="url(#ledGlow)" />' +
        '<path class="mirror-frame" d="' + pathMain + '" fill="none" stroke="url(#bevelGrad)" stroke-width="' + facetW + '" />' +
        '<path class="mirror-body" d="' + pathMain + '" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />' +
        '<ellipse cx="' + (boxX + boxW - rectW * 0.5) + '" cy="' + (boxY + boxH * 0.3) + '" rx="' + Math.max(1, rectW * 0.3) + '" ry="' + (boxH * 0.22) + '" fill="url(#windowGrad)" opacity="0.5" />' +
        '<ellipse cx="' + (boxX + boxW - rectW * 0.2) + '" cy="' + (boxY + boxH * 0.55) + '" rx="' + Math.max(1, rectW * 0.15) + '" ry="' + (boxH * 0.18) + '" fill="url(#windowGrad)" opacity="0.3" />' +
        '<path d="M ' + boxX + ' ' + boxY + ' L ' + (boxX + boxW) + ' ' + (boxY + boxH) + ' L ' + (boxX + boxW) + ' ' + (boxY + boxH * 0.6) + ' L ' + boxX + ' ' + boxY + ' Z" fill="url(#glareGrad)" opacity="0.8" />' +
        '<path d="' + pathMain + '" fill="url(#cornerGlow)" />' +
        '<path d="M ' + (boxX + rr) + ' ' + (boxY + boxH * 0.6) + ' L ' + (boxX + rr) + ' ' + (boxY + boxH) + ' A ' + rr + ' ' + rr + ' 0 0 0 ' + boxX + ' ' + (boxY + rr) + ' A ' + rr + ' ' + rr + ' 0 0 0 ' + (boxX + rr * 0.5) + ' ' + (boxY + boxH * 0.75) + ' Z" fill="url(#floorGrad)" opacity="0.5" />' +
        '<rect x="' + (boxX + rr) + '" y="' + (boxY + boxH * 0.6) + '" width="' + Math.max(0, rectW) + '" height="' + (boxH * 0.4) + '" fill="url(#floorGrad)" opacity="0.5" />' +
        logoText(boxX, boxY, boxW, boxH);
    } else if (shape === 'double' || shape === 'semidouble') {
      var h2v = parseFloat(document.getElementById('height2').value) || 60;
      var totalH = parseFloat(h) + parseFloat(h2v);
      var aspectD = parseFloat(w) / totalH;
      var bw, bh;
      if (aspectD >= 1) {
        bw = AVAIL_W; bh = AVAIL_W / aspectD;
        if (bh > AVAIL_H) { bh = AVAIL_H; bw = AVAIL_H * aspectD; }
      } else {
        bh = AVAIL_H; bw = AVAIL_H * aspectD;
        if (bw > AVAIL_W) { bw = AVAIL_W; bh = AVAIL_W / aspectD; }
      }
      var boxXD = (VB_W - bw) / 2;
      var boxYD = (VB_H - bh) / 2;
      var ratio = h / totalH;
      var topH = bh * ratio;
      var botH = bh - topH;
      var gap = 4;
      var topY = boxYD;
      var botY = boxYD + topH + gap;
      content = '';
      if (hasLight) {
        content += '<rect x="' + (boxXD - 8) + '" y="' + (topY - 8) + '" width="' + (bw + 16) + '" height="' + (topH + 8) + '" rx="9" fill="none" stroke="' + glowColor + '" stroke-width="6" opacity="0.8" filter="url(#ledGlow)" />';
        content += '<rect x="' + (boxXD - 8) + '" y="' + (botY - 8) + '" width="' + (bw + 16) + '" height="' + (botH + 8) + '" rx="9" fill="none" stroke="' + glowColor + '" stroke-width="6" opacity="0.8" filter="url(#ledGlow)" />';
      }
      content += '<rect x="' + boxXD + '" y="' + topY + '" width="' + bw + '" height="' + topH + '" rx="4" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />';
      content += '<rect x="' + boxXD + '" y="' + botY + '" width="' + bw + '" height="' + botH + '" rx="4" fill="url(#glassGrad)" stroke="#2a3a4e" stroke-width="1" />';
      content += logoText(boxXD, botY, bw, botH);
    }

    var defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
    svg.insertAdjacentHTML('beforeend', content);
  }

  function pickShape(shape) {
    state.shape = shape;
    var fieldH = document.getElementById('fieldH');
    var labelW = document.getElementById('labelW');
    var labelH = document.getElementById('labelH');
    var inputW = document.getElementById('width');
    var inputH = document.getElementById('height');

    inputH.disabled = false;
    inputH.style.opacity = '1';

    if (shape === 'circle') {
      fieldH.classList.add('hidden');
      labelW.textContent = 'Диаметр, см';
      inputW.value = 90;
      inputH.value = 90;
    } else if (shape === 'double') {
      fieldH.classList.remove('hidden');
      labelW.textContent = 'Ширина, см';
      labelH.textContent = 'Высота верхней, см';
      inputW.value = 80;
      inputH.value = 160;
      document.getElementById('height2').value = 60;
    } else if (shape === 'semidouble') {
      fieldH.classList.remove('hidden');
      labelW.textContent = 'Ширина, см';
      labelH.textContent = 'Высота, см';
      inputW.value = 80;
      inputH.value = 180;
    } else {
      fieldH.classList.remove('hidden');
      labelW.textContent = 'Ширина, см';
      labelH.textContent = 'Высота, см';
      inputW.value = 80;
      inputH.value = 180;
    }

    onSizeInput();
    updPreview();
  }

  function setLight(on) {
    state.light = on;
    var wrap = document.getElementById('mirrorWrap');
    if (wrap) wrap.classList.toggle('has-light', on);
    renderMirrorSvg();

    var blockLight = document.getElementById('blockLight');
    var blockColor = document.getElementById('blockColor');
    if (blockLight) blockLight.classList.toggle('hidden', !on);
    if (blockColor) blockColor.classList.toggle('hidden', !on);
    updateFilmAvailability();
  }

  function updateFilmAvailability() {
    var filmOpt = document.getElementById('filmOpt');
    var filmCb = $('input[name="option"][value="film"]');
    var installCb = $('input[name="option"][value="install"]');
    var installInfo = document.getElementById('installInfo');
    var canFilm = installCb && installCb.checked;
    if (filmOpt) filmOpt.classList.toggle('hidden', !canFilm);
    if (filmCb && !canFilm) {
      filmCb.checked = false;
      state.film = false;
    }
    if (installInfo) installInfo.classList.toggle('hidden', !(installCb && installCb.checked));
  }

  function onFacetChange() {
    readState();
    var info = document.getElementById('edgeInfo');
    if (info) {
      if (state.facet === 'none') {
        info.textContent = 'Обработка кромки от пореза включена';
        info.classList.remove('gold');
      } else {
        info.textContent = 'Фацет ' + state.facet + ' мм — обработка от пореза не требуется';
        info.classList.add('gold');
      }
    }
    renderMirrorSvg();
  }

  function calcGeometry() {
    var wEl = document.getElementById('width');
    var hEl = document.getElementById('height');
    var w = parseFloat(wEl.value) || 0;
    var h = parseFloat(hEl.value) || 0;
    var shape = state.shape;

    var area, per, maxD;

    if (shape === 'rect') {
      area = (w * h) / 10000;
      per = 2 * (w + h) / 100;
      maxD = Math.max(w, h);
    } else if (shape === 'circle') {
      var d = w;
      area = Math.PI * (d / 2) * (d / 2) / 10000;
      per = Math.PI * d / 100;
      maxD = d;
    } else if (shape === 'oval') {
      var a = w / 2, b = h / 2;
      area = Math.PI * a * b / 10000;
      per = (Math.PI / 2) * (3 * (w + h) - Math.sqrt((3 * w + h) * (w + 3 * h))) / 100;
      maxD = Math.max(w, h);
    } else if (shape === 'semicircle') {
      var r = h / 2;
      var rectW = Math.max(0, w - r);
      area = (rectW * h + Math.PI * r * r / 2) / 10000;
      per = (h + rectW * 2 + Math.PI * r) / 100;
      maxD = Math.max(w, h);
    } else if (shape === 'double') {
      var h2v = parseFloat(document.getElementById('height2').value) || 0;
      area = (w * h + w * h2v) / 10000;
      per = (2 * (w + h) + 2 * (w + h2v)) / 100;
      maxD = Math.max(w, h, h2v);
    } else if (shape === 'semidouble') {
      area = (w * h + w * h) / 10000;
      per = (2 * (w + h) + 2 * (w + h)) / 100;
      maxD = Math.max(w, h);
    }

    return { area: area, per: per, maxD: maxD };
  }

  function calc() {
    readState();
    var wEl = document.getElementById('width');
    var hEl = document.getElementById('height');
    var w = parseFloat(wEl.value) || 0;
    var h = parseFloat(hEl.value) || 0;

    if (w < 40 || (state.shape !== 'circle' && h < 40)) { alert('Минимальный размер — 40 см'); return; }

    var maxD = (state.shape === 'circle') ? w : Math.max(w, h);

    var tariff = maxD <= 250 ? 1500 : 1400;
    var edgeRate = maxD <= 250 ? 150 : 80;
    var delivery = maxD <= 250 ? 300 : 1800;

    var geo = calcGeometry();
    var blankArea = (w * h) / 10000;
    var per = geo.per;
    var installArea = geo.area;

    var isFigured = (state.shape === 'circle' || state.shape === 'oval' || state.shape === 'semicircle');

    var costMirror = blankArea * tariff;
    var cuttingCost = isFigured ? costMirror * 0.3 : 0;
    var totalMirrorCost = costMirror + cuttingCost;

    var costEdge = per * edgeRate;

    var facetRate = { none: 0, 10: 180, 20: 210, 25: 260 };
    var costFacet = (facetRate[state.facet] || 0) * per;
    var facetDelivery = state.facet !== 'none' ? 1000 : 0;

    var ledRolls = state.light ? Math.ceil(per / 5) : 0;
    var costLED = ledRolls * 700;
    var costBlock = state.light ? (per > 5 ? 1000 : 700) : 0;
    var costSwitch = state.light ? 600 : 0;
    var costAngle = state.light ? Math.max(per, 6) * 80 : 0;
    var costAngleDel = state.light ? 1000 : 0;

    var costFilm = state.film ? blankArea * 120 : 0;

    var costHeat = state.heat ? 2500 : 0;

    var costInstall = 0;
    if (state.install) {
      if (state.light) {
        var baseInst;
        if (installArea <= 2) {
          baseInst = Math.max(2000, installArea * 1300);
        } else {
          baseInst = installArea * 1500;
        }
        costInstall = Math.max(2500, baseInst + 500);
      } else {
        if (installArea <= 2) {
          costInstall = Math.max(2000, installArea * 1300);
        } else {
          costInstall = installArea * 1500;
        }
      }
    }

    var price;
    var profitMirror;
    if (state.light) {
      var mirrorMarkup = isFigured ? 1.7 : 1.5;
      price = totalMirrorCost * (1 + mirrorMarkup) + costEdge + delivery + costFacet + facetDelivery + costLED + costBlock + costSwitch + costAngle + costAngleDel + costFilm + costHeat + costInstall;
      profitMirror = totalMirrorCost * mirrorMarkup;
    } else {
      var markupRate = isFigured ? 1.0 : 0.7;
      price = (costMirror + costEdge) * (1 + markupRate) + cuttingCost + delivery + costFacet + facetDelivery + costFilm + costHeat + costInstall;
      profitMirror = (costMirror + costEdge) * markupRate;
    }
    var profitInstall = costInstall;
    var totalProfit = profitMirror + profitInstall;

    var sizeText = '';
    if (state.shape === 'circle') {
      sizeText = 'Ø ' + w + ' см · ' + SHAPE_NAMES[state.shape];
    } else if (state.shape === 'double') {
      var h2r = parseFloat(document.getElementById('height2').value) || 0;
      sizeText = h + '+' + h2r + ' × ' + w + ' см · ' + SHAPE_NAMES[state.shape];
    } else {
      sizeText = h + ' × ' + w + ' см · ' + SHAPE_NAMES[state.shape];
    }
    document.getElementById('r-size').textContent = sizeText + (state.light ? ' · С подсветкой' : ' · Без подсветки');

    document.getElementById('r-sum').textContent = fmt(price) + ' ₽';

    var inc = '<div class="row"><span>Зеркало (' + SHAPE_NAMES[state.shape].toLowerCase() + ')</span></div>';
    inc += '<div class="row"><span>Обработка кромки от пореза</span></div>';
    if (state.light) {
      inc += '<div class="row"><span>LED-подсветка COB</span></div>';
      inc += '<div class="row"><span>Блок питания + выключатель</span></div>';
      inc += '<div class="row"><span>Алюминиевый каркас из уголка 1,5 мм</span></div>';
    }
    inc += '<div class="row"><span>Доставка по Ставрополю</span></div>';
    if (costFacet > 0) inc += '<div class="row"><span>Фацет ' + state.facet + ' мм</span></div>';
    if (costInstall > 0) inc += '<div class="row"><span>Установка</span></div>';
    if (costFilm > 0) inc += '<div class="row"><span>Бронеплёнка</span></div>';
    if (costHeat > 0) inc += '<div class="row"><span>Подогрев 40×60 см</span></div>';

    document.getElementById('r-inc').innerHTML = inc;

    var CLR_LABELS = { warm: 'тёплый', cold: 'холодный', neutral: 'нейтральный' };
    var CTRL_LABELS = { wave: 'взмах рукой', touch: 'сенсор на зеркале', remote: 'пульт ДУ', smart: 'Wi-Fi / умный дом' };
    var FACET_LABELS = { none: 'без фацета', '10': 'фацет 10 мм', '20': 'фацет 20 мм', '25': 'фацет 25 мм' };

    var details = [];
    if (state.light) {
      details.push('с LED-подсветкой (' + CLR_LABELS[state.clr] + ', управление: ' + CTRL_LABELS[state.ctrl] + ')');
    } else {
      details.push('без подсветки');
    }
    if (state.facet !== 'none') details.push(FACET_LABELS[state.facet]);
    if (state.install) details.push('с установкой');

    var ctaText = '';
    if (state.shape === 'double') {
      var h2c = parseFloat(document.getElementById('height2').value) || 0;
      ctaText = 'Здравствуйте! Хочу заказать зеркало из двух частей ' + h + '+' + h2c + '×' + w + ' см' + (details.length ? ' — ' + details.join(', ') : '') + '. Стоимость по калькулятору: ' + fmt(Math.round(price)) + ' ₽.';
    } else if (state.shape === 'semidouble') {
      ctaText = 'Здравствуйте! Хочу заказать полукруг из двух частей ' + h + '×' + w + ' см' + (details.length ? ' — ' + details.join(', ') : '') + '. Стоимость по калькулятору: ' + fmt(Math.round(price)) + ' ₽.';
    } else {
      ctaText = 'Здравствуйте! Хочу заказать ' + SHAPE_NAMES[state.shape].toLowerCase() + ' зеркало ' + (state.shape === 'circle' ? 'Ø' + w : h + '×' + w) + ' см' + (details.length ? ' — ' + details.join(', ') : '') + '. Стоимость по калькулятору: ' + fmt(Math.round(price)) + ' ₽.';
    }
    document.getElementById('r-cta').href = MAX_URL + '?text=' + encodeURIComponent(ctaText);

    var res = document.getElementById('calc-result');
    res.classList.add('show');
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- События калькулятора ---------- */
  $all('input[name="shape"]').forEach(function (r) {
    r.addEventListener('change', function () { pickShape(r.value); });
  });
  $all('input[name="light"]').forEach(function (r) {
    r.addEventListener('change', function () { setLight(r.value === 'on'); });
  });
  $all('input[name="clr"]').forEach(function (r) {
    r.addEventListener('change', function () { readState(); renderMirrorSvg(); });
  });
  $all('input[name="facet"]').forEach(function (r) {
    r.addEventListener('change', onFacetChange);
  });
  $all('input[name="option"][value="install"]').forEach(function (r) {
    r.addEventListener('change', function () { readState(); updateFilmAvailability(); });
  });
  $all('.stepper-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      adj(b.dataset.adj, parseInt(b.dataset.delta, 10));
    });
  });
  var sizeInputs = ['width', 'height', 'height2'];
  sizeInputs.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', onSizeInput);
  });

  var quoteForm = $('#quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calc();
    });
  }

  /* ---------- Инициализация превью ---------- */
  if (document.getElementById('mirrorSvg')) {
    setTimeout(renderMirrorSvg, 100);
    updPreview();
    onSizeInput();
  }
})();
