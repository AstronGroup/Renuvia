/* ==========================================================================
   Renuvia — advertorial
   Seletor de planos, contador, FAQ, animações de entrada e CTA fixa.
   ========================================================================== */
(function () {
  'use strict';

  var D = document;
  var W = window;
  var reduceMotion = W.matchMedia && W.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ------------------------------------------------------------------------
     >>> LINKS DE CHECKOUT DA CARTPANDA <<<
     Troque as duas URLs abaixo pelos links de compra da CartPanda.
     É só aqui — vale para as duas seções de oferta da página.
     ------------------------------------------------------------------------ */
  var BUY_LINKS = {
    monthly: 'https://astrongroup.mycartpanda.com/checkout/211549480:1&subscription=4502', /* Subscribe & Save — $39.99 */
    onetime: 'https://astrongroup.mycartpanda.com/checkout/211517992:1'    /* One-time purchase — $59.99 */
  };

  /* Anexa o afid da URL atual (ex.: ?afid=hRL9seBssW) ao link de checkout,
     preservando qualquer query string que o link já tenha. */
  function withAfid(url) {
    var afid = '';
    try {
      afid = new URLSearchParams(W.location.search).get('afid') || '';
    } catch (e) {
      var m = W.location.search.match(/[?&]afid=([^&]+)/);
      afid = m ? decodeURIComponent(m[1]) : '';
    }
    if (!afid) return url;
    if (/[?&]afid=/.test(url)) return url; /* já tem afid — não duplica */
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'afid=' + encodeURIComponent(afid);
  }

  /* ------------------------------------------------------------------------
     Seletor de planos — radiogroup acessível, com teclado
     ------------------------------------------------------------------------ */
  D.querySelectorAll('.kg-offer').forEach(function (offer) {
    var group = offer.querySelector('.plans');
    if (!group) return;

    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Choose your plan');

    var plans = Array.prototype.slice.call(offer.querySelectorAll('.plan'));
    var ctas = Array.prototype.slice.call(offer.querySelectorAll('.offer-cta'));

    function updateCta(plan) {
      var link = BUY_LINKS[plan.getAttribute('data-plan')];
      if (!link) return;
      link = withAfid(link);
      ctas.forEach(function (cta) {
        cta.setAttribute('href', link);
      });
    }

    function select(plan, focus) {
      plans.forEach(function (p) {
        var on = p === plan;
        p.classList.toggle('selected', on);
        p.setAttribute('aria-checked', on ? 'true' : 'false');
        p.tabIndex = on ? 0 : -1;
      });
      updateCta(plan);
      if (focus) plan.focus();
    }

    /* Aponta o CTA para o plano já selecionado ao carregar a página */
    var initial = offer.querySelector('.plan.selected') || plans[0];
    if (initial) updateCta(initial);

    plans.forEach(function (plan, i) {
      var isSelected = plan.classList.contains('selected');
      var title = plan.querySelector('.plan-title');
      var price = plan.querySelector('.plan-price');

      plan.setAttribute('role', 'radio');
      plan.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      plan.tabIndex = isSelected ? 0 : -1;
      plan.setAttribute(
        'aria-label',
        (title ? title.textContent : 'Plan') + ' ' + (price ? price.textContent : '')
      );

      plan.addEventListener('click', function () {
        select(plan, false);
      });

      plan.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === ' ' || k === 'Enter') {
          e.preventDefault();
          select(plan, true);
        } else if (k === 'ArrowDown' || k === 'ArrowRight') {
          e.preventDefault();
          select(plans[(i + 1) % plans.length], true);
        } else if (k === 'ArrowUp' || k === 'ArrowLeft') {
          e.preventDefault();
          select(plans[(i - 1 + plans.length) % plans.length], true);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     CTA da oferta — enquanto a URL do checkout não existe (href="#"),
     impede o salto para o topo da página
     ------------------------------------------------------------------------ */
  D.querySelectorAll('.offer-cta').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('href') === '#') e.preventDefault();
    });
  });

  /* ------------------------------------------------------------------------
     Contador — prazo único compartilhado entre as duas ofertas,
     persistido em localStorage para sobreviver a um reload
     ------------------------------------------------------------------------ */
  var timers = D.querySelectorAll('.kg-timer');
  if (timers.length) {
    var DURATION = 599000; /* 9:59 */
    var KEY = 'kgDeadline';
    var deadline = parseInt(W.localStorage && localStorage.getItem(KEY), 10);

    if (!deadline || isNaN(deadline) || deadline < Date.now()) {
      deadline = Date.now() + DURATION;
      try {
        localStorage.setItem(KEY, deadline);
      } catch (e) {
        /* modo privado: segue só em memória */
      }
    }

    var format = function (ms) {
      var total = Math.max(0, Math.floor(ms / 1000));
      var m = Math.floor(total / 60);
      var s = total % 60;
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    };

    var interval = setInterval(function () {
      var remaining = deadline - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        D.querySelectorAll('.offer-timer').forEach(function (el) {
          el.innerHTML = '<strong>Last chance</strong> — this batch is nearly gone.';
        });
        return;
      }

      var text = format(remaining);
      timers.forEach(function (t) {
        if (t.textContent === text) return;
        t.textContent = text;
        if (reduceMotion) return;
        t.classList.add('tick');
        setTimeout(function () {
          t.classList.remove('tick');
        }, 300);
      });
    }, 1000);
  }

  /* ------------------------------------------------------------------------
     FAQ — acordeão acessível
     ------------------------------------------------------------------------ */
  D.querySelectorAll('.faq-acc .faq-q').forEach(function (question, i) {
    var answer = question.nextElementSibling;
    if (!answer) return;

    question.setAttribute('role', 'button');
    question.tabIndex = 0;
    question.setAttribute('aria-expanded', 'false');
    answer.id = answer.id || 'faq-panel-' + i;
    question.setAttribute('aria-controls', answer.id);

    function toggle() {
      var icon = question.querySelector('.ic');
      var isOpen = Boolean(answer.style.maxHeight);

      answer.style.maxHeight = isOpen ? '' : answer.scrollHeight + 'px';
      question.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (icon) icon.textContent = isOpen ? '+' : '−';
    }

    question.addEventListener('click', toggle);
    question.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ------------------------------------------------------------------------
     Revelar ao rolar
     ------------------------------------------------------------------------ */
  var revealNodes = D.querySelectorAll('.fx-reveal');

  if (!('IntersectionObserver' in W) || reduceMotion) {
    revealNodes.forEach(function (n) {
      n.classList.add('is-in');
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    revealNodes.forEach(function (n) {
      io.observe(n);
    });

    /* rede de segurança: nada fica invisível se o observer não disparar */
    setTimeout(function () {
      revealNodes.forEach(function (n) {
        n.classList.add('is-in');
      });
    }, 3500);
  }

  /* ------------------------------------------------------------------------
     Barra de progresso de leitura
     ------------------------------------------------------------------------ */
  var progress = D.getElementById('read-progress');
  if (progress) {
    var ticking = false;

    var update = function () {
      var el = D.documentElement;
      var max = el.scrollHeight - el.clientHeight;
      progress.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    };

    W.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    W.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     Âncoras — salto instantâneo quando a distância é grande demais para
     uma rolagem suave ser útil
     ------------------------------------------------------------------------ */
  D.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;

      var target;
      try {
        target = D.querySelector(id);
      } catch (err) {
        return;
      }
      if (!target) return;

      e.preventDefault();
      var far = Math.abs(target.getBoundingClientRect().top) > 2200 || reduceMotion;
      target.scrollIntoView({ behavior: far ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ------------------------------------------------------------------------
     CTA fixa — só entra depois que o primeiro CTA do texto sai de vista
     (antes disso o leitor já tem um botão na tela) e some quando um
     checkout está à vista
     ------------------------------------------------------------------------ */
  var sticky = D.querySelector('.sticky-cta');
  if (sticky) {
    var offers = [D.getElementById('offer-top'), D.getElementById('offer')];
    var firstCta = D.querySelector('.cta-btn-wrap');

    var updateSticky = function () {
      var vh = W.innerHeight;
      var pastFirstCta = firstCta
        ? firstCta.getBoundingClientRect().bottom < 0
        : (W.pageYOffset || D.documentElement.scrollTop || 0) > 500;
      var offerVisible = offers.some(function (o) {
        if (!o) return false;
        var r = o.getBoundingClientRect();
        return r.top < vh * 0.9 && r.bottom > vh * 0.1;
      });
      sticky.classList.toggle('show', pastFirstCta && !offerVisible);
    };

    W.addEventListener('scroll', updateSticky, { passive: true });
    W.addEventListener('resize', updateSticky, { passive: true });
    updateSticky();
  }
})();
