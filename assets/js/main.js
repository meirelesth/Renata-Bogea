/* ==========================================================================
   Núcleo Dra. Renata Bogéa — interações
   Tudo funciona sem animação: GSAP/Lenis só enriquecem a experiência.
   ========================================================================== */
(() => {
  'use strict';

  const CLINICA_WHATSAPP = '5598991663020';
  // Opcional: URL do backend que envia o e-mail de agendamento (pasta backend/).
  // Ex.: 'https://seu-backend.onrender.com/api/booking'. Vazio = só WhatsApp.
  const AGENDA_API = '';

  const doc = document;
  const root = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const mqReduz = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFino = matchMedia('(hover: hover) and (pointer: fine)');
  const mqDesk = matchMedia('(min-width: 1025px)');
  const animar = !!(window.gsap && window.ScrollTrigger) && !mqReduz.matches;

  root.classList.add(animar ? 'anim' : 'sem-anim');
  $$('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- rolagem suave ---------- */
  let lenis = null;
  if (animar && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((t) => lenis.raf(t * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }
  const irPara = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: mqReduz.matches ? 'auto' : 'smooth', block: 'start' });
  };

  /* ---------- interesse pré-selecionado no formulário ---------- */
  const selInteresse = $('#f-interesse');
  const definirInteresse = (valor) => {
    if (!selInteresse || !valor) return;
    const op = Array.from(selInteresse.options).find((o) => o.value === valor);
    if (op) selInteresse.value = op.value;
  };

  /* ---------- menu em tela cheia ---------- */
  const nav = $('#nav');
  const menu = $('#menu');
  const btnMenu = $('#btnMenu');
  const txtMenu = $('.nav-menu-txt', btnMenu);
  let menuAberto = false;

  const focaveisMenu = () => [btnMenu, ...$$('a, button', menu)];
  function abrirMenu() {
    menuAberto = true;
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('aberto')));
    nav.classList.add('menu-aberto');
    nav.classList.remove('oculta');
    btnMenu.setAttribute('aria-expanded', 'true');
    btnMenu.setAttribute('aria-label', 'Fechar menu');
    if (txtMenu) txtMenu.textContent = 'Fechar';
    root.classList.add('travado');
    if (lenis) lenis.stop();
    atualizarZap();
    setTimeout(() => { if (menuAberto) $('a', menu).focus({ preventScroll: true }); }, 450);
  }
  function fecharMenu(devolverFoco = true) {
    menuAberto = false;
    menu.classList.remove('aberto');
    nav.classList.remove('menu-aberto');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menu');
    if (txtMenu) txtMenu.textContent = 'Menu';
    root.classList.remove('travado');
    if (lenis) lenis.start();
    setTimeout(() => { if (!menuAberto) menu.hidden = true; }, 950);
    if (devolverFoco) btnMenu.focus({ preventScroll: true });
    atualizarZap();
  }
  btnMenu.addEventListener('click', () => (menuAberto ? fecharMenu() : abrirMenu()));
  doc.addEventListener('keydown', (e) => {
    if (!menuAberto) return;
    if (e.key === 'Escape') { e.preventDefault(); fecharMenu(); return; }
    if (e.key === 'Tab') {
      const f = focaveisMenu();
      const i = f.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- âncoras internas ---------- */
  doc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const alvo = doc.getElementById(id.slice(1));
    if (!alvo) return;
    e.preventDefault();
    definirInteresse(a.dataset.interesse);
    const estavaAberto = menuAberto;
    if (estavaAberto) fecharMenu(false);
    setTimeout(() => {
      irPara(alvo);
      if (alvo.id === 'conteudo') alvo.focus({ preventScroll: true });
    }, estavaAberto ? 380 : 0);
  });

  /* ---------- navegação: some ao descer, volta ao subir ---------- */
  const hero = $('#topo');
  const zap = $('.zap');
  const formEl = $('#form-agenda');
  const rodape = $('.rodape');
  let ultimoY = window.scrollY;
  let formVisivel = false;
  let rodapeVisivel = false;

  function atualizarZap() {
    if (!zap) return;
    const passouHero = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 400);
    zap.classList.toggle('visivel', passouHero && !formVisivel && !rodapeVisivel && !menuAberto);
  }
  function aoRolar() {
    const y = window.scrollY;
    const limite = hero ? hero.offsetHeight - 90 : 300;
    nav.classList.toggle('solida', y > limite);
    if (!menuAberto) {
      const descendo = y > ultimoY + 2;
      const subindo = y < ultimoY - 2;
      if (descendo && y > 220) nav.classList.add('oculta');
      else if (subindo || y <= 220) nav.classList.remove('oculta');
    }
    ultimoY = y;
    atualizarZap();
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  if (formEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { formVisivel = en.isIntersecting; atualizarZap(); }, { threshold: 0.12 }).observe(formEl);
  }
  if (rodape && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { rodapeVisivel = en.isIntersecting; atualizarZap(); }, { rootMargin: '0px 0px -25% 0px' }).observe(rodape);
  }

  /* ---------- vídeo do hero ---------- */
  const video = $('.hero-video video');
  const btnPausa = $('.hero-pausa');
  let pausadoPeloUsuario = false;
  const tocar = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
  function marcarPausa(pausado) {
    if (!btnPausa) return;
    btnPausa.setAttribute('aria-pressed', String(pausado));
    btnPausa.setAttribute('aria-label', pausado ? 'Reproduzir vídeo' : 'Pausar vídeo');
  }
  if (video) {
    if (mqReduz.matches) { video.removeAttribute('autoplay'); video.pause(); pausadoPeloUsuario = true; marcarPausa(true); }
    else tocar();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (pausadoPeloUsuario) return;
        if (en.isIntersecting) tocar(); else video.pause();
      }, { threshold: 0.05 }).observe(video);
    }
    if (btnPausa) {
      btnPausa.addEventListener('click', () => {
        if (video.paused) { pausadoPeloUsuario = false; tocar(); marcarPausa(false); }
        else { pausadoPeloUsuario = true; video.pause(); marcarPausa(true); }
      });
    }
  }

  /* brilho ambiente: o próprio vídeo, desfocado, tinge o fundo do hero */
  const amb = $('.hero-ambiente');
  if (amb && video && mqDesk.matches && !mqReduz.matches) {
    const ctx = amb.getContext('2d');
    amb.width = 36; amb.height = 20;
    let heroVisivel = true;
    let t0 = 0;
    const desenhar = (t) => {
      if (heroVisivel && video.readyState >= 2 && t - t0 > 100) {
        try { ctx.drawImage(video, 0, 0, amb.width, amb.height); } catch (_) { /* ignora */ }
        t0 = t;
      }
      requestAnimationFrame(desenhar);
    };
    requestAnimationFrame(desenhar);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { heroVisivel = en.isIntersecting; }).observe(hero);
  }

  /* ---------- trilho de tratamentos no celular: barra de progresso ---------- */
  const janela = $('.trat-janela');
  const barra = $('.trat-barra span');
  if (janela && barra) {
    janela.addEventListener('scroll', () => {
      if (mqDesk.matches) return;
      const max = janela.scrollWidth - janela.clientWidth;
      barra.style.transform = `scaleX(${max > 0 ? janela.scrollLeft / max : 0})`;
    }, { passive: true });
  }

  /* ---------- formulário de agendamento ---------- */
  const form = formEl;
  if (form) {
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const hoje = iso(new Date());
    form.elements.data.min = hoje;

    const tel = form.elements.telefone;
    tel.addEventListener('input', () => {
      const d = tel.value.replace(/\D/g, '').slice(0, 11);
      let v = d;
      if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length >= 10) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      tel.value = v;
    });

    const regras = {
      nome: (v) => v.trim().split(/\s+/).filter(Boolean).length >= 2 || 'Informe nome e sobrenome.',
      telefone: (v) => v.replace(/\D/g, '').length >= 10 || 'Informe um WhatsApp com DDD.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido.',
      data: (v) => {
        if (!v) return 'Escolha uma data.';
        if (v < hoje) return 'Escolha uma data a partir de hoje.';
        const dia = new Date(`${v}T12:00:00`).getDay();
        return (dia !== 0 && dia !== 6) || 'Atendemos de segunda a sexta. Escolha outro dia.';
      },
      horario: (v) => !!v || 'Escolha um horário.',
    };
    const validar = (nome) => {
      const campo = form.elements[nome];
      const r = regras[nome](campo.value);
      const ok = r === true;
      const box = campo.closest('.campo');
      box.classList.toggle('erro', !ok);
      campo.setAttribute('aria-invalid', String(!ok));
      const msg = $('.campo-erro', box);
      if (msg) msg.textContent = ok ? '' : r;
      return ok;
    };
    Object.keys(regras).forEach((nome) => {
      const campo = form.elements[nome];
      campo.addEventListener('blur', () => { if (campo.value) validar(nome); });
      campo.addEventListener('change', () => validar(nome));
      campo.addEventListener('input', () => { if (campo.closest('.campo').classList.contains('erro')) validar(nome); });
    });

    const retorno = $('#retorno');
    const mostrarRetorno = (texto, tipo) => { retorno.textContent = texto; retorno.className = `retorno ${tipo}`; };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalidos = Object.keys(regras).filter((n) => !validar(n));
      if (invalidos.length) {
        mostrarRetorno('Revise os campos destacados para continuar.', 'erro');
        form.elements[invalidos[0]].focus();
        return;
      }
      const f = form.elements;
      const dados = {
        modalidade: f.modalidade.value || 'Presencial',
        nome: f.nome.value.trim(),
        telefone: f.telefone.value.trim(),
        email: f.email.value.trim(),
        data: f.data.value,
        horario: f.horario.value,
        interesse: f.interesse.value,
        mensagem: f.mensagem.value.trim(),
      };
      const linhas = [
        'Olá! Gostaria de agendar uma consulta com a Dra. Renata Bogéa.',
        '',
        `Modalidade: ${dados.modalidade}`,
        `Nome: ${dados.nome}`,
        `WhatsApp: ${dados.telefone}`,
        `E-mail: ${dados.email}`,
        `Data preferida: ${dados.data.split('-').reverse().join('/')}`,
        `Horário: ${dados.horario}`,
        `Área de interesse: ${dados.interesse}`,
      ];
      if (dados.mensagem) linhas.push(`Mensagem: ${dados.mensagem}`);
      const url = `https://wa.me/${CLINICA_WHATSAPP}?text=${encodeURIComponent(linhas.join('\n'))}`;

      const janelaZap = window.open(url, '_blank');
      if (janelaZap) { try { janelaZap.opener = null; } catch (_) { /* ignora */ } }
      else window.location.href = url;

      if (AGENDA_API) {
        fetch(AGENDA_API, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados), keepalive: true,
        }).catch(() => {});
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'agendamento_solicitado', interesse: dados.interesse, modalidade: dados.modalidade });
      mostrarRetorno('Abrimos o WhatsApp com a sua solicitação. Toque em enviar para a recepção confirmar o horário.', 'ok');
    });
  }

  /* ==========================================================================
     Camada de animação (somente com GSAP e sem "reduzir movimento")
     ========================================================================== */
  const loader = $('.loader');
  if (!animar) { if (loader) loader.remove(); return; }

  const { gsap, ScrollTrigger } = window;
  const temSplit = !!window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (temSplit) gsap.registerPlugin(window.SplitText);

  /* ---------- abertura ---------- */
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  intro
    .from('.hero-linha > span', { yPercent: 112, duration: 1.5, stagger: 0.12 }, 0)
    .from('.hero-kicker, .hero-sub, .hero-acoes, .hero-rodape', { y: 26, autoAlpha: 0, duration: 1.3, stagger: 0.09 }, 0.3)
    .from(nav, { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 0.45);
  if (matchMedia('(min-width: 901px)').matches) {
    intro.fromTo('.hero-video', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' }, 0)
      .from('.hero-video video', { scale: 1.3, duration: 2.2 }, 0.2);
  } else {
    intro.from('.hero-video video', { scale: 1.18, duration: 2.4 }, 0);
  }

  let jaViu = false;
  try { jaViu = sessionStorage.getItem('rb-intro') === '1'; sessionStorage.setItem('rb-intro', '1'); } catch (_) { /* ignora */ }

  const soltar = () => { root.classList.remove('travado'); if (lenis) lenis.start(); intro.play(0); };
  if (loader && !jaViu) {
    root.classList.add('travado');
    if (lenis) lenis.stop();
    const haste = $('.m-haste');
    const comp = haste.getTotalLength ? haste.getTotalLength() : 650;
    const bojo = $('.m-bojo');
    const compBojo = bojo.getTotalLength ? bojo.getTotalLength() : 420;
    gsap.set(haste, { strokeDasharray: comp, strokeDashoffset: comp });
    gsap.set(bojo, { strokeDasharray: compBojo, strokeDashoffset: compBojo });
    gsap.set('.m-pendulo', { svgOrigin: '25 40', rotation: 16 });
    gsap.set(loader, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.timeline({ onComplete: () => loader.remove() })
      .to('.loader-trama', { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .to(haste, { strokeDashoffset: 0, duration: 0.9, ease: 'power3.inOut' }, 0.15)
      .from('.m-ponto', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' }, 0.9)
      .to('.m-pendulo', { rotation: 0, duration: 1.9, ease: 'elastic.out(1, 0.32)' }, 0.9)
      .from('.m-cima', { autoAlpha: 0, x: -120, y: -120, duration: 1.1, ease: 'expo.out' }, 1.0)
      .from('.m-perna', { autoAlpha: 0, x: 120, y: 120, duration: 1.1, ease: 'expo.out' }, 1.05)
      .to(bojo, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 1.25)
      .from('.loader-nome', { autoAlpha: 0, y: 16, duration: 1, ease: 'expo.out' }, 1.4)
      .to('.loader-centro', { y: -30, autoAlpha: 0, duration: 0.8, ease: 'power3.in' }, 2.55)
      .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.15, ease: 'expo.inOut' }, 2.75)
      .add(soltar, 3.05);
  } else {
    if (loader) gsap.to(loader, { autoAlpha: 0, duration: 0.5, onComplete: () => loader.remove() });
    soltar();
  }

  const mm = gsap.matchMedia();

  /* ---------- tratamentos: trilho horizontal fixado (desktop) ----------
     Criado antes dos demais gatilhos para que o espaço do pin entre no cálculo deles. */
  mm.add('(min-width: 1025px)', () => {
    const sec = $('.tratamentos');
    const trilho = $('.trat-trilho');
    const jan = $('.trat-janela');
    if (!sec || !trilho || !jan) return undefined;
    const dist = () => Math.max(0, trilho.scrollWidth - jan.clientWidth);
    gsap.to(trilho, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => `+=${dist()}`,
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => { if (barra) barra.style.transform = `scaleX(${s.progress})`; },
      },
    });
    return () => { if (barra) barra.style.transform = 'scaleX(0)'; };
  });

  /* ---------- títulos linha a linha ---------- */
  if (temSplit) {
    $$('[data-split]').forEach((el) => {
      window.SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 112, duration: 1.4, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      });
    });
    const manifesto = $('[data-palavras]');
    if (manifesto) {
      window.SplitText.create(manifesto, {
        type: 'words', autoSplit: true,
        onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.14 }, {
          opacity: 1, ease: 'none', stagger: 0.08,
          scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 48%', scrub: true },
        }),
      });
    }
  }

  /* ---------- entradas suaves ---------- */
  $$('[data-subir]').forEach((el) => {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  /* ---------- imagens: cortina + zoom ---------- */
  $$('[data-revelar]').forEach((el) => {
    const midia = $('img, video', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' });
    if (midia) tl.fromTo(midia, { scale: 1.32 }, { scale: 1, duration: 2.1, ease: 'expo.out' }, 0.15);
  });

  /* ---------- parallax ---------- */
  $$('[data-parallax]').forEach((el) => {
    const img = $('img', el);
    if (!img) return;
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* ---------- pêndulo de progresso ---------- */
  const ponto = $('.pendulo-ponto');
  if (ponto) {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => gsap.set(ponto, { y: s.progress * 150 }) });
  }

  /* ---------- pilares: imagem que acompanha o cursor ---------- */
  mm.add('(min-width: 1025px) and (hover: hover) and (pointer: fine)', () => {
    const seg = $('.seguidor');
    const lista = $('.pilares-lista');
    if (!seg || !lista) return undefined;
    const img = $('img', seg);
    $$('.pilar', lista).forEach((li) => { const i = new Image(); i.src = li.dataset.img; });
    gsap.set(seg, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
    const xTo = gsap.quickTo(seg, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(seg, 'y', { duration: 0.7, ease: 'power3' });
    const mover = (e) => { xTo(e.clientX); yTo(e.clientY); };
    const entrar = (e) => {
      const li = e.currentTarget;
      if (img.getAttribute('src') !== li.dataset.img) img.src = li.dataset.img;
      gsap.to(seg, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
    };
    const sair = () => gsap.to(seg, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: 'power3.out' });
    const itens = $$('.pilar', lista);
    lista.addEventListener('mousemove', mover);
    itens.forEach((li) => li.addEventListener('mouseenter', entrar));
    lista.addEventListener('mouseleave', sair);
    return () => {
      lista.removeEventListener('mousemove', mover);
      itens.forEach((li) => li.removeEventListener('mouseenter', entrar));
      lista.removeEventListener('mouseleave', sair);
    };
  });

  /* ---------- cursor ---------- */
  if (mqFino.matches) {
    root.classList.add('cursor-on');
    const cur = $('.cursor');
    const pontoC = $('.cursor-ponto');
    const anel = $('.cursor-anel');
    const txt = $('.cursor-txt');
    gsap.set([pontoC, anel], { xPercent: -50, yPercent: -50 });
    const px = gsap.quickTo(pontoC, 'x', { duration: 0.12, ease: 'power3' });
    const py = gsap.quickTo(pontoC, 'y', { duration: 0.12, ease: 'power3' });
    const ax = gsap.quickTo(anel, 'x', { duration: 0.55, ease: 'power3' });
    const ay = gsap.quickTo(anel, 'y', { duration: 0.55, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      px(e.clientX); py(e.clientY); ax(e.clientX); ay(e.clientY);
      cur.classList.add('ativo');
    }, { passive: true });
    doc.addEventListener('pointerover', (e) => {
      const t = e.target;
      const campo = t.closest('input, select, textarea, iframe');
      const rotulado = t.closest('[data-cursor]');
      const clicavel = t.closest('a, button, summary, label');
      cur.classList.toggle('oculto', !!campo);
      cur.classList.toggle('sobre', !!clicavel && !rotulado);
      cur.classList.toggle('com-txt', !!rotulado);
      txt.textContent = rotulado ? rotulado.dataset.cursor : '';
    });
    root.addEventListener('mouseleave', () => cur.classList.remove('ativo'));
    $$('iframe').forEach((f) => f.addEventListener('mouseenter', () => cur.classList.remove('ativo')));
  }

  /* ---------- recalcula após fontes e imagens ---------- */
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
