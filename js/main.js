document.querySelectorAll('.rev-help').forEach(function(b){
        b.addEventListener('click',function(){
          var n=b.querySelector('.n'); if(!n) return;
          if(b.getAttribute('data-on')){ n.textContent=(+n.textContent-1); b.removeAttribute('data-on'); b.style.color=''; }
          else { n.textContent=(+n.textContent+1); b.setAttribute('data-on','1'); b.style.color='var(--azure-deep)'; }
        });
      });

/* ---------------------------------- */

// buy-box option toggle + point the checkout link at the selected plan
  var addBtn = document.getElementById('add-to-cart');
  function selectOpt(o){
    document.querySelectorAll('[data-opt]').forEach(function(x){x.classList.remove('is-active')});
    o.classList.add('is-active');
    if(addBtn && o.dataset.checkout){ addBtn.setAttribute('href', o.dataset.checkout); }
  }
  document.querySelectorAll('[data-opt]').forEach(function(o){
    o.addEventListener('click',function(){ selectOpt(o); });
  });
  var activeOpt = document.querySelector('[data-opt].is-active');
  if(activeOpt){ selectOpt(activeOpt); }
  // faq accordion
  document.querySelectorAll('.qa button').forEach(function(b){
    b.addEventListener('click',function(){
      var qa=b.parentElement, ans=qa.querySelector('.ans'), open=qa.classList.contains('open');
      document.querySelectorAll('.qa').forEach(function(x){
        x.classList.remove('open');
        x.querySelector('.ans').style.maxHeight=null;
        x.querySelector('button').setAttribute('aria-expanded','false');
      });
      if(!open){
        qa.classList.add('open');
        ans.style.maxHeight=ans.scrollHeight+'px';
        b.setAttribute('aria-expanded','true');
      }
    });
  });
  // mobile menu (simple scroll to buy)
  var burger = document.querySelector('.burger');
  if (burger) burger.addEventListener('click',function(){
    var buy = document.getElementById('buy');
    if (buy) buy.scrollIntoView({behavior:'smooth'});
  });

/* ---------------------------------- */

(function(){
      var root = document.querySelector('[data-carousel]');
      if(!root) return;
      var slides = root.querySelectorAll('.carousel-slide');
      var thumbs = document.querySelectorAll('.carousel-thumb');
      var i = 0, n = slides.length;
      function go(k){
        i = (k % n + n) % n;
        slides.forEach(function(s,idx){ s.classList.toggle('is-active', idx===i); });
        thumbs.forEach(function(t,idx){ t.classList.toggle('is-active', idx===i); });
      }
      // ---- autoplay: advance on its own, gently ----
      var DELAY = 5000, timer = null;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      function start(){ if(reduce || n<2 || timer) return; timer = setInterval(function(){ go(i+1); }, DELAY); }
      function stop(){ if(timer){ clearInterval(timer); timer = null; } }
      function restart(){ stop(); start(); }               // reset timer after manual interaction
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', start);
      document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });

      var prev = root.querySelector('.carousel-prev'); if(prev) prev.addEventListener('click', function(){ go(i-1); restart(); });
      var next = root.querySelector('.carousel-next'); if(next) next.addEventListener('click', function(){ go(i+1); restart(); });
      thumbs.forEach(function(t,idx){ t.addEventListener('click', function(){ go(idx); restart(); }); });
      root.addEventListener('keydown', function(e){
        if(e.key==='ArrowLeft'){ go(i-1); restart(); } else if(e.key==='ArrowRight'){ go(i+1); restart(); }
      });
      start();
    })();

/* ---------------------------------- */

// ingredients diamond carousel
    (function(){
      var car = document.querySelector('[data-ing-carousel]');
      if(!car) return;
      var slides = car.querySelectorAll('.ing-slide');
      var dots = document.querySelectorAll('[data-ing-dots] .ing-dot');
      var i = 0, n = slides.length;
      function go(k){
        i = (k % n + n) % n;
        slides.forEach(function(s,idx){ s.classList.toggle('is-active', idx===i); });
        dots.forEach(function(d,idx){ d.classList.toggle('is-active', idx===i); });
      }
      car.querySelector('.ing-prev').addEventListener('click', function(){ go(i-1); });
      car.querySelector('.ing-next').addEventListener('click', function(){ go(i+1); });
      dots.forEach(function(d,idx){ d.addEventListener('click', function(){ go(idx); }); });
    })();

/* ---------------------------------- */

(function(){
      var el = document.querySelector('[data-timeline]');
      if(!el) return;
      if(!('IntersectionObserver' in window)){ el.classList.add('is-in'); return; }
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      io.observe(el);
    })();

/* ---------------------------------- */

// how-to-use: reveal each step and draw the connecting line as it scrolls in
(function(){
      var steps = document.querySelectorAll('[data-steps] .step');
      if(!steps.length) return;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      if(reduce || !('IntersectionObserver' in window)){
        steps.forEach(function(s){ s.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });
      steps.forEach(function(s){ io.observe(s); });
    })();

/* ---------------------------------- */

// pour scene is now static (scroll animation disabled) — nothing to drive.

/* ---------------------------------- */

// header: subtle shadow + solidify once the page is scrolled
(function(){
      var h = document.querySelector('header');
      if(!h) return;
      var onScroll = function(){ h.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive:true });
      onScroll();
    })();

/* ---------------------------------- */

// scroll reveal: fade + rise as elements enter the viewport
// (skips the hero and the steps/timeline, which animate on their own)
(function(){
      if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      if(!('IntersectionObserver' in window)) return;
      var sel = '.trust, .sec-head, .b5-card, .b5-media, .how-media, .std-media, .std-studies li,'
              + '.ing-carousel, .ing-badges, .ing-dots, .rev-item, .panel, .facts .use, .allergen,'
              + '.qa, .band, .tl-foot';
      var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function(el){
        return !el.closest('.hero');
      });
      els.forEach(function(el){ el.classList.add('reveal'); });
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function(el){ io.observe(el); });
    })();
