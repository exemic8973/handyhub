const fs = require("fs");
const path = require("path");

fs.writeFileSync(path.join(__dirname, "public/css/style.css"), `
/* ═══════════════════════════════════════════════════════
   FixIt Pro v2 — Complete Stylesheet
   ═══════════════════════════════════════════════════════ */

:root {
  --bg: #F8F7F4;
  --bg-dark: #0F1117;
  --surface: #FFFFFF;
  --surface-dark: #1A1D27;
  --surface-dark-2: #222632;
  --accent: #E8A838;
  --accent-hover: #D4952E;
  --accent-light: rgba(232, 168, 56, 0.1);
  --accent-glow: rgba(232, 168, 56, 0.25);
  --text: #1A1D27;
  --text-light: #F8F7F4;
  --text-muted: #6B7280;
  --text-muted-light: #9CA3AF;
  --border: #E5E7EB;
  --border-light: #F0EDE8;
  --border-dark: #2D3142;
  --success: #10B981;
  --success-bg: rgba(16, 185, 129, 0.1);
  --warning: #F59E0B;
  --warning-bg: rgba(245, 158, 11, 0.1);
  --danger: #EF4444;
  --danger-bg: rgba(239, 68, 68, 0.1);
  --info: #3B82F6;
  --info-bg: rgba(59, 130, 246, 0.1);
  --purple: #8B5CF6;
  --purple-bg: rgba(139, 92, 246, 0.1);
  --radius: 14px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 48px rgba(0,0,0,0.12);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.16);
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: 0.15s ease;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body { font-family: var(--font-body); color: var(--text); background: var(--bg); line-height: 1.6; overflow-x: hidden; opacity: 0; transition: opacity 0.4s ease; }
body.loaded { opacity: 1; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
input, select, textarea, button { font-family: inherit; font-size: inherit; }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 700; line-height: 1.2; }
::selection { background: var(--accent); color: #000; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.container { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }
.text-muted { color: var(--text-muted); }
.gradient-text { background: linear-gradient(135deg, var(--accent), #F59E0B, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* ═══════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════ */
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.4rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.9rem; border: 2px solid transparent; cursor: pointer; transition: var(--transition); white-space: nowrap; position: relative; overflow: hidden; }
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: var(--transition); }
.btn:hover::after { opacity: 1; }
.btn--primary { background: var(--accent); color: #000; border-color: var(--accent); }
.btn-color: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }
.btn--outline { background: transparent; border-color: var(--border); color: var(--text); }
.btn--outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn--danger { background: transparent; border-color: var(--danger); color: var(--danger); }
.btn--danger:hover { background: var(--danger); color: #fff; transform: translateY(-1px); }
.btn--ghost { background: transparent; border-color: rgba(255,255,255,0.2); color: var(--text-light); }
.btn--ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(232,168,56,0.08); }
.btn--sm { padding: 0.4rem 0.9rem;--primary:hover { background: var(--accent-hover); border font-size: 0.8rem; }
.btn--lg { padding: 0.85rem 1.8rem; font-size: 1rem; }
.btn--icon { width: 40px; height: 40px; padding: 0; justify-content: center; border-radius: 50%; }
.btn:active { transform: translateY(0) scale(0.98); }

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════ */
.toast { position: fixed; top: 84px; right: 1.5rem; z-index: 9999; display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.2rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg); font-size: 0.9rem; font-weight: 500; transform: translateX(120%); opacity: 0; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); max-width: 420px; }
.toast--visible { transform: translateX(0); opacity: 1; }
.toast--success { border-left: 4px solid var(--success); }
.toast--success i { color: var(--success); }
.toast--error { border-left: 4px solid var(--danger); }
.toast--error i { color: var(--danger); }
.toast--info { border-left: 4px solid var(--info); }
.toast--info i { color: var(--info); }
.toast__close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.2rem; margin-left: 0.5rem; transition: var(--transition-fast); }
.toast__close:hover { color: var(--text); }

/* ═══════════════════════════════════════════
   ALERTS
   ═══════════════════════════════════════════ */
.alert { display: flex;; top: 0; left: align-items: center; gap: 0.75rem; padding: 0.85rem 1.2rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; transition: all 0.3s ease; }
.alert--success { background: var(--success-bg); color: #065F46; border: 1px solid rgba(16,185,129,0.2); }
.alert--error { background: var(--danger-bg); color: #991B1B; border: 1px solid rgba(239,68,68,0.2); }

/* ═══════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════ */
.header { position: fixed 0; right: 0; z-index: 100; background: rgba(15, 17, 23, 0.75); backdrop-filter: blur(24px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.04); transition: all 0.35s ease; }
.header--scrolled { background: rgba(15, 17, 23, 0.95); border-bottom-color: rgba(255,255,255,0.08); box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
.header__inner { display: flex; align-items: center; justify-content: space-between; height: 70px; }
.logo { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-display); font-weight: 800; font-size: 1.35rem; color: var(--text-light); transition: var(--transition); }
.logo:hover { opacity: 0.85; }
.logo__icon { color: var(--accent); font-size: 1.15rem; }
.logo__accent { color: var(--accent); }
.nav { display: flex; align-items: center; gap: 0.25rem; }
.nav__link { padding: 0.5rem 0.9rem; border-radius: var(--radius-sm); color: var(--text-muted-light); font-weight: 500; font-size: 0.88rem; transition: var(--transition); position: relative; }
.nav__link:hover, .nav__link.active { color: var(--text-light); background: rgba(255,255,255,0.06); }
.nav__link.active::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 20px; height: 2px; background: var(--accent); border-radius: 2px; }
.nav__user { display: flex; align-items: center; gap: 0.8rem; margin-left: 0.5rem; }
.nav__greeting { color: var(--text-muted-light); font-size: 0.85rem; }
.header__burger { display: none; background: none; border: none; cursor: pointer; padding: 0.5rem; z-index: 101; }
.header__burger span { display: block; width: 22px; height: 2px; background: var(--text-light); margin: 5px 0; transition: var(--transition); border-radius: 2px; }
.header__burger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.header__burger.active span:nth-child(2) { opacity: 0; }
.header__burger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
.hero { position: relative; min-height: 100vh; display: flex; align-items: center; background: var(--bg-dark); overflow: hidden; padding-top: 70px; }
.hero__bg { position: absolute; inset: 0; overflow: hidden; }
.hero__shape { position: absolute; border-radius: 50%; filter: blur(120px); will-change: transform; }
.hero__shape--1 { width: 600px; height: 600px; background: var(--accent); top: -200px; right: -100px; opacity: 0.12; }
.hero__shape--2 { width: 400px; height: 400px; background: #3B82F6; bottom: -100px; left: -100px; opacity: 0.08; }
.hero__shape--3 { width: 300px; height: 300px; background: #8B5CF6; top: 50%; left: 50%; opacity: 0.06; }
.hero__content { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; padding: 4rem 0; }
.hero__badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.85rem; font-weight: 500; background: rgba(232,168,56,0.1); color: var(--accent); margin-bottom: 1.5rem; animation: fadeUp 0.6s ease both; }
.hero__title { font-size: clamp(2.5rem, 5vw, 4.2rem); color: var(--text-light); margin-bottom: 1.2rem; letter-spacing: -0.025em; animation: fadeUp 0.6s ease 0.1s both; }
.hero__subtitle { font-size: 1.15rem; color: var(--text-muted-light); max-width: 520px; margin-bottom: 2rem; line-height: 1.75; animation: fadeUp 0.6s ease 0.2s both; }
.hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; animation: fadeUp 0.6s ease 0.3s both; }
.hero__stats { display: flex; gap: 2.5rem; animation: fadeUp 0.6s ease 0.4s both; }
.hero__stat { display: flex; flex-direction: column; }
.hero__stat strong { font-family: var(--font-display); font-size: 1.6rem; color: var(--text-light); font-weight: 800; }
.hero__stat span { font-size: 0.82rem; color: var(--text-muted-light); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
.hero__visual { position: relative; display: flex; justify-content: center; animation: fadeUp 0.8s ease 0.3s both; }
.hero__card-stack { position: relative; width: 360px; height: 380px; }
.hero__float-card { position: absolute; display: flex; align-items: center; gap: 1rem; padding: 1rem 1.3rem; border-radius: var(--radius); background: var(--surface-dark); border: 1px solid var(--border-dark); box-shadow: var(--shadow-xl); animation: floatCard 6s ease-in-out infinite; transition: transform 0.3s ease; }
.hero__float-card:hover { transform: scale(1.03) !important; }
.hero__float-card i { font-size: 1.5rem; }
.hero__float-card strong { display: block; color: var(--text-light); font-size: 0.95rem; }
.hero__float-card span { font-size: 0.8rem; color: var(--text-muted-light); }
.hero__float-card--1 { top: 0; left: 0; animation-delay: 0s; }
.hero__float-card--2 { top: 110px; right: -10px; animation-delay: 1.5s; }
.hero__float-card--3 { bottom: 20px; left: 10px; animation-delay: 3s; }
.hero__float-check { background: var(--success); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; }
.hero__avatar-row { display: flex; }
.avatar-sm { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; color: #fff; border: 2px solid var(--surface-dark); }
.avatar-sm + .avatar-sm { margin-left: -8px; }

@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes revealUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

/* ═══════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════ */
.section { padding: 5.5rem 0; }
.section--dark { background: var(--bg-dark); color: var(--text-light); }
.section__header { text-align: center; max-width: 600px; margin: 0 auto 3.5rem; }
.section__label { display: inline-block; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 0.75rem; }
.section__title { font-size: clamp(1.8rem, 3vw, 2.6rem); margin-bottom: 0.75rem; letter-spacing: -0.02em; }
.section--dark .section__title { color: var(--text-light); }
.section__desc { color: var(--text-muted); font-size: 1.05rem; line-height: 1.7; }
.section--dark .section__desc { color: var(--text-muted-light); }
.section__cta { text-align: center; margin-top: 3rem; }

.page-header { padding: 7rem 0 2rem; background: var(--bg-dark); color: var(--text-light); border-bottom: 1px solid var(--border-dark); }
.page-header h1 { font-size: 2.2rem; margin-bottom: 0.3rem; }
.page-header p { color: var(--text-muted-light); font-size: 1.05rem; }

/* ═══════════════════════════════════════════
   SERVICE CARDS
   ═══════════════════════════════════════════ */
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
.service-card { position: relative; display: flex; flex-direction: column; gap: 0.75rem; padding: 1.75rem; border-radius: var(--radius); background: var(--surface-dark); border: 1px solid var(--border-dark); transition: var(--transition); overflow: hidden; cursor: pointer; }
.service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-accent, var(--accent)); transform: scaleX(0); transition: transform 0.35s ease; transform-origin: left; }
.service-card:hover { transform: translateY(-4px); border-color: var(--card-accent, var(--accent)); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.service-card:hover::before { transform: scaleX(1); }
.service-card__icon { width: 48px; height: 48px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; background: rgba(232,168,56,0.1); color: var(--card-accent,80px; padding: 0 1.5rem; position: relative; }
.step__number { font-family: var(--font-display); font-size: 3.5rem; font-weight: 900; color: var(--accent); opacity: 0.15; line-height var(--accent)); font-size: ; justify-content:1.2rem; transition: var(--transition); }
.service-card:hover .service-card__icon { transform: scale(1.1); }
.service-card h3 { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-light); }
.service-card p { font-size: 0.88rem; color: var(--text-muted-light); line-height: 1.6; }
.service-card__arrow { margin-top: auto; padding-top: 0.5rem; color: var(--text-muted-light); transition: var(--transition); }
.service-card:hover .service-card__arrow { color: var(--card-accent, var(--accent)); transform: translateX(4px); }

/* ═══════════════════════════════════════════
   STEPS
   ═══════════════════════════════════════════ */
.steps { display: flex; align-items: flex-start center; gap: 0; }
.step { text-align: center; max-width: 2: 1; margin-bottom: -1rem; position: relative; z-index: 0; }
.step__icon { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 1.2rem; display: flex; align-items: center; justify-content: center; background: var(--accent-light); color: var(--accent); font-size: 1.4rem; position: relative; z-index: 1; transition: var(--transition); }
.step:hover .step__icon { background: var(--accent); color: #000; transform: scale(1.1); box-shadow: 0 8px 30px var(--accent-glow); }
.step h3 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.step p { color: var(--text-muted); font-size: 0.92rem; line-height: 1.65; }
.step__connector { flex: 0 0 60px; height: 2px; background: linear-gradient(90deg, var(--border), var(--accent), var(--border)); margin-top: 3.5rem; opacity: 0.4; }

/* ═══════════════════════════════════════════
   HANDYMAN CARDS
   ═══════════════════════════════════════════ */
.handymen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.handyman-card { border-radius: var(--radius); overflow: hidden; background: var(--surface-dark); border: 1px solid var(--border-dark); transition: var(--transition); display: flex; flex-direction: column; }
.handyman-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); border-color: rgba(255,255,255,0.1); }
.handyman-card__top { padding: 2rem 1.5rem 1.5rem; text-align: center; background: linear-gradient(135deg, rgba(232,168,56,0.06), var(--surface-dark)); border-bottom: 1px solid var(--border-dark); }
.handyman-card__avatar { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--accent), #D4952E); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: #000; position: relative; box-shadow: 0 4px 16px var(--accent-glow); }
.verified-badge { position: absolute; bottom: -2px; right: -2px; width: 22px; height: 22px; border-radius: 50%; background: var(--success); color: #fff; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface-dark); }
.handyman-card__top h3 { font-size: 1.1rem; color: var(--text-light); margin-bottom: 0.3rem; }
.handyman-card__category { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--accent); font-weight: 500; }
.handyman-card__body { padding: 1.25rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; }
.handyman-card__body p { font-size: 0.88rem; color: var(--text-muted-light); line-height: 1.6; margin-bottom: 1rem; flex: 1; }
.handyman-card__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.handyman-card__rating { font-size: 0.88rem; color: var(--text-light); font-weight: 600; }
.handyman-card__rating i { color: #F59E0B; }
.handyman-card__rating small { color: var(--text-muted-light); font-weight: 400; }
.handyman-card__price { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--accent); }
.handyman-card__details { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted-light); }
.handyman-card__details i { color: var(--text-muted-light); margin-right: 0.3rem; }

/* ═══════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════ */
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.testimonial-card { padding: 2rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); transition: var(--transition); box-shadow: var(--shadow-sm); }
.testimonial-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.testimonial-card__stars { color: #F59E0B; margin-bottom: 1rem; font-size: 0.85rem; display: flex; gap: 0.15rem; }
.testimonial-card p { font-size: 0.95rem; color: var(--text); line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
.testimonial-card__author { display: flex; align-items: center; gap: 0.75rem; }
.testimonial-card__author strong { display: block; font-size: 0.9rem; }
.testimonial-card__author span { font-size: 0.8rem; color: var(--text-muted); }

/* ═══════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════ */
.cta-section { padding: 3rem 0 6rem; }
.cta-card { padding: 4rem; border-radius: var(--radius-xl); background: linear-gradient(135deg, var(--bg-dark), #1a1530); border: 1px solid var(--border-dark); text-align: center; position: relative; overflow: hidden; }
.cta-card::before { content: ''; position: absolute; top: -50%; right: -30%; width: 500px; height: 500px; border-radius: 50%; background: var(--accent); opacity: 0.06; filter: blur(80px); }
.cta-card__content { position: relative; }
.cta-card h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); color: var(--text-light); margin-bottom: 0.75rem; }
.cta-card p { color: var(--text-muted-light); font-size: 1.1rem; margin-bottom: 2rem; }
.cta-card__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
.footer { background: var(--bg-dark); color: var(--text-muted-light); padding: 4rem 0 2rem; border-top: 1px solid var(--border-dark); }
.footer__grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
.footer__brand p { margin-top: 0.75rem; font-size: 0.9rem; line-height: 1.7; max-width: 300px; }
.footer__links { display: flex; flex-direction: column; gap: 0.6rem; }
.footer__links h4 { font-family: var(--font-display); font-size: 0.95rem; color: var(--text-light); margin-bottom: 0.5rem; }
.footer__links a { font-size: 0.88rem; transition: var(--transition-fast); }
.footer__links a:hover { color: var(--accent); }
.footer__bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--border-dark); font-size: 0.85rem; }
.footer__social { display: flex; gap: 1rem; }
.footer__social a { font-size: 1.1rem; transition: var(--transition-fast); }
.footer__social a:hover { color: var(--accent); transform: translateY(-2px); }

/* ═══════════════════════════════════════════
   AUTH PAGES
   ═══════════════════════════════════════════ */
.auth-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-dark); padding: 5rem 1.5rem 3rem; background-image: radial-gradient(ellipse at 30% 20%, rgba(232,168,56,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.04) 0%, transparent 50%); }
.auth-card { width: 100%; max-width: 440px; background: var(--surface-dark); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-xl); }
.auth-card--wide { max-width: 620px; }
.auth-card__header { text-align: center; margin-bottom: 2rem; }
.auth-card__header h1 { font-size: 1.6rem; color: var(--text-light); margin: 0.75rem 0 0.25rem; }
.auth-card__header p { color: var(--text-muted-light); font-size: 0.92rem; }
.auth-card__footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted-light); }
.auth-card__footer a { color: var(--accent); font-weight: 600; }
.auth-card__footer a:hover { text-decoration: underline; }
.auth-card__demo { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-dark); text-align: center; font-size: 0.82rem; color: var(--text-muted-light); }
.demo-accounts { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem; }
.demo-accounts code { padding: 0.25rem 0.6rem; background: var(--surface-dark-2); border-radius: 4px; font-size: 0.78rem; color: var(--accent); }

/* ═══════════════════════════════════════════
   FORMS
   ═══════ label { font-size: 0.85rem; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 0.4rem; }
.form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form__group input, .form__group select, .form__group textarea { padding: 0.7rem 0.9rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg); font-size: 0.92rem; transition: var(--transition); color: var(--text); width: 100%; }
.form__group input:focus, .form__group select:focus, .form__group textarea:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-light); }
.form__group input.input-error, .form__group textarea.input-error { border-color: var(--danger); box-shadow: 0 0 0 3px var(--danger-bg); }
.form__group textarea { resize════════════════════════════════════ */
.form { display: flex; flex-direction: column; gap: 1.1rem; }
.form__group { display: flex; flex-direction: column; gap: 0.4rem; }
.form__group: vertical; min-height: 80px; }
.form__group select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2.5rem; }
.auth-card .form__group input, .auth-card .form__group select, .auth-card .form__group textarea { background: var(--surface-dark-2); border-color: var(--border-dark); color: var(--text-light); }
.auth-card .form__group label { color: var(--text-muted-light); }
.input-wrapper { position: relative; }
.input-wrapper input { padding-right: 2.5rem; width: 100%; }
.input-toggle { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; transition: var(--transition-fast); }
.input-toggle:hover { color: var(--accent); }
.input-sm { padding: 0.45rem 0.7rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg); font-size: 0.85rem; width: 120px; }
.input-sm:focus { border-color: var(--accent); outline: none; }
.role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.role-option { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.25rem; border-radius: var(--radius); border: 2px solid var(--border-dark); cursor: pointer; transition: var(--transition); text-align: center; color: var(--text-muted-light); font-size: 0.88rem; font-weight: 500; }
.role-option input { display: none; }
.role-option i { font-size: 1.5rem; }
.role-option.active, .role-option:hover { border-color: var(--accent); background: rgba(232,168,56,0.06); color: var(--accent); }
.role-option.active i { transform: scale(1.1); }
.checkbox-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.92rem; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }

/* ═══════════════════════════════════════════
   FILTER BAR
   ═══════════════════════════════════════════ */
.filter-bar { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; padding: 1rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
.filter-bar__search { flex: 1; min-width: 200px; position: relative; }
.filter-bar__search i { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.9rem; }
.filter-bar__search input { width: 100%; padding: 0.65rem 0.9rem 0.65rem 2.4rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg); font-size: 0.9rem; transition: var(--transition); }
.filter-bar__search input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-light); }
.filter-bar__select { padding: 0.65rem 2.2rem 0.65rem 0.9rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg); font-size: 0.88rem; appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.7rem center; }
.filter-bar__select:focus { border-color: var(--accent); outline: none; }
.filter-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filter-tabs a { padding: 0.45rem 1rem; border-radius: 50px; font-size: 0.82rem; font-weight: 500; color: var(--text-muted); background: var(--surface); border: 1px solid var(--border); transition: var(--transition); }
.filter-tabs a:hover { border-color: var(--accent); color: var(--accent); }
.filter-tabs a.active { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 600; }

/* ═══════════════════════════════════════════
   PROFILE PAGE
   ═══════════════════════════════════════════ */
.profile-layout { display: grid; grid-template-columns: 380px 1fr; gap: 2rem; align-items: start; }
.profile-card { border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); position: sticky; top: 90px; }
.profile-card__header { padding: 2.5rem 2rem; text-align: center; background: linear-gradient(135deg, rgba(232,168,56,0.08), var(--surface)); border-bottom: 1px solid var(--border); }
.profile-card__avatar { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--accent), #D4952E); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #000; box-shadow: 0 6px 24px var(--accent-glow); position: relative; }
.profile-card__header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
.profile-card__category { color: var(--accent); font-weight: 500; font-size: 0.92rem; }
.profile-card__body { padding: 1.5rem 2rem 2rem; }
.profile-card__stats { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.stat-pill { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; background: var(--bg); color: var(--text); border: 1px solid var(--border); }
.stat-pill i { font-size: 0.7rem; }
.profile-card__body h3 { font-size: 1rem; margin-bottom: 0.5rem; }
.profile-card__body p { color: var(--text-muted); font-size: 0.92rem; line-height: 1.7; margin-bottom: 1rem; }
.profile-card__info { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.88rem; color: var(--text-muted); }
.profile-card__info i { width: 18px; text-align: center; margin-right: 0.25rem; }
.profile-reviews h2 { font-size: 1.3rem; margin-bottom: 1.25rem; }
.review-card { padding: 1.25rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); margin-bottom: 1rem; transition: var(--transition); }
.review-card:hover { box-shadow: var(--shadow-sm); }
.review-card__header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.review-card__header strong { font-size: 0.92rem; }
.review-card__stars { color: #F59E0B; font-size: 0.75rem; display: flex; gap: 0.1rem; }
.review-card__date { margin-left: auto; font-size: 0.78rem; color: var(--text-muted); }
.review-card p { font-size: 0.9rem; color: var(--text); line-height: 1.65; }
.review-form { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.star-input { display: flex; flex-direction: row-reverse; gap: 0.15rem; justify-content: flex-end; }
.star-input input { display: none; }
.star-input label { cursor: pointer; font-size: 1.3rem; color: var(--border); transition: var(--transition-fast); }
.star-input label:hover, .star-input label:hover ~ label { color: #F59E0B; }

/* ═══════════════════════════════════════════
   DASHBOARD LAYOUT
   ═══════════════════════════════════════════ */
.dashboard-layout { display: flex; min-height: 100vh; padding-top: 70px; }
.dashboard-main { flex: 1; padding: 2rem 2.5rem; max-width: 100%; overflow-x: hidden; }
.dashboard-main__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.dashboard-main__header h1 { font-size: 1.8rem; }
.sidebar { width: 260px; background: var(--surface); border-right: 1px solid var(--border); padding: 1.5rem 0; position: sticky; top: 70px; height: calc(100vh - 70px); overflow-y: auto; flex-shrink: 0; transition: var(--transition); }
.sidebar__header { display: flex; align-items: center; gap: 0.75rem; padding: 0 1.25rem 1.25rem; border-bottom: 1px solid var(--border); margin-bottom: 0.75rem; }
.sidebar__avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), #D4952E); display: flex; align-items: center; justify-content: center; color: #000; font-size: 1rem; flex-shrink: 0; }
.sidebar__header strong { font-size: 0.92rem; display: block; }
.sidebar__role { font-size: 0.75rem; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.sidebar__nav { display: flex; flex-direction: column; gap: 0.15rem; padding: 0 0.75rem; }
.sidebar__nav a { display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 500; color: var(--text-muted); transition: var(--transition); }
.sidebar__nav a i { width: 18px; text-align: center; font-size: 0.85rem; }
.sidebar__nav a:hover { background: var(--bg); color: var(--text); }
.sidebar__nav a.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.sidebar__divider { height: 1px; background: var(--border); margin: 0.75rem 0; }
.sidebar__toggle { display: none; padding: 0.6rem 1rem; margin-bottom: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.9rem; font-weight: 500; width: 100%; text-align: left; }
.sidebar--collapsed { transform: translateX(-100%); position: fixed; z-index: 50; }

/* ═══════════════════════════════════════════
   STATS CARDS
   ═══════════════════════════════════════════ */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stats-grid--6 { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); transition: var(--transition); }
.stat-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.stat-card__icon { width: 48px; height: 48px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.stat-card__info { display: flex; flex-direction: column; }
.stat-card__value { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; line-height: 1.2; }
.stat-card__label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

/* ═══════════════════════════════════════════
   CAR1E40DS & TABLES
   ═══════════════════════════════════════════ */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
.card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
.card__header h2 { font-size: 1.1rem; }
.admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.table thead { border-bottom: 2px solid var(--border); }
.table th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); fontAF; }
.badge--in_progress { background: var(--purple-bg); color: #5B21B6; }
.badge--completed { background: var(--success-bg); color: #065F46; }
.badge--declined { background: var(--danger-bg); color: #991B1B; }
.badge--cancelled { background: #F3F4F6; color: #4B5563; }
.badge--admin { background: var(--accent-light); color: var(--accent-hover); border: 1px solid var(--accent); }

/* ═══════════════════════════════════════════
   BOOKING ITEMS
   ═══════════════════════════════════════════ */
.bookings-list { display: flex; flex-direction: column; gap: 1rem; }
.booking-item { padding: 1.25rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); transition: var(--transition); }
.booking-item:hover { box-shadow: var(--shadow-sm); }
.booking-item--highlight { border-left: 4px solid var(--warning); background: rgba(245,158,11,0.02); }
.booking-item__main { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.booking-item__info h3 { font-size: 1rem; margin-bottom: 0.4rem; }
.booking-item__info p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.2rem; }
.booking-item__info i { width: 14px; text-align: center; margin-right: 0.15rem; font-size: 0.75rem; }
.booking-item__status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }
.booking-item__price { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--success); }
.booking-item__actions { display: flex; gap: 0.5rem; margin-top: 0.75rem-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
.table tbody tr { transition: var(--transition-fast); }
.table tbody tr:hover { background: var(--bg); }

/* ═══════════════════════════════════════════
   BADGES
   ═══════════════════════════════════════════ */
.badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.65rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
.badge--pending { background: var(--warning-bg); color: #92400E; }
.badge--accepted { background: var(--info-bg); color: #; flex-wrap:0.88rem; }
.leaderboard-item__rating i { color: #F59E0B; font-size: 0.75rem; }

/* ═══════════════════════════════════════════
   EMPTY STATES & SCROLL REVEAL
   ═══════════════════════════════════════════ */
.empty-state { text-align: center; padding: 3rem 2rem; color: var(--text-muted); }
.empty-state i { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; }
.empty-state h3 { font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text); }
.empty-state p { margin-bottom: 1.5rem; font-size: 0.92rem; }
.revealed { animation: revealUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both; }

/* ═══════════════════════════════════════════
   RESPONSIVE — TABLET
   ═══════════════════════════════════════════ */
@media (max-width: 1024px) {
  .hero__content { grid-template-columns: 1fr; text-align: center; }
  .hero__subtitle { margin-left: auto; margin-right: auto; }
  .hero__actions { justify-content: center; }
  .hero__stats { justify-content: center; }
  .hero__visual { display: none; }
  .profile-layout { grid-template-columns: 1fr; }
  .profile-card { position: static; }
  .admin-grid { grid-template-columns: 1fr; }
  .footer__grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .steps { flex-direction: column; align-items: center; gap: 2rem; }
  .step__connector { display: none; }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — MOBILE
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .header__burger { display: block; }
  .nav { position: fixed; top: 0; right: 0; bottom: 0; width: 280px; background: var(--bg-dark); flex-direction: column; padding: 5rem 1.5rem 2rem; transform: translateX(100%); transition: transform 0.35s ease; border-left: 1px solid var(--border-dark); gap: 0.5rem; z-index: 100; }
  .nav.open { transform: translateX(0); box-shadow: -10px 0 40px rgba(0,0,0,0.3); }
  .nav__link { padding: 0.75rem; font-size: 1rem; }
  .nav__user { flex-direction: column; align-items: flex-start; margin-left: 0; margin-top: 1rem; width: 100%; }
  .dashboard-layout { flex-direction: column; }
  .sidebar { width: 100%; position: fixed; top: 70px; left: 0; right: 0; height: auto; max-height: 0; overflow: hidden; z-index: 50; border-right: none; border-bottom: 1px solid var(--border); transition: max-height 0.35s ease; }
  .sidebar:not(.sidebar--collapsed) { max-height: 400px; }
  .sidebar__toggle { display: block; }
  .dashboard-main { padding: 1.5rem; }
  .form__row { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; }
  .filter-bar__search { min-width: auto; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .stats-grid--6 { grid-template-columns: 1fr 1fr; }
  .handymen-grid { grid-template-columns: 1fr; }
  .services-grid { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .footer__grid { grid-template-columns: 1fr; }
  .footer__bottom { flex-direction: column; gap: 1rem; text-align: center; }
  .hero__stats { flex-direction: column; gap: 1rem; align-items: center; }
  .cta-card { padding: 2.5rem 1.5rem; }
  .page-header h1 { font-size: 1.6rem; }
  .booking-item__main { flex-direction: column; }
  .booking-item__status { align-items: flex-start; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .role-toggle { grid-template-columns: 1fr; }
  .hero__actions { flex-direction: column; }
  .hero__actions .btn { width: 100%; justify-content: center; }
  .cta-card__actions { flex-direction: column; }
  .cta-card__actions .btn { width: 100%; justify-content: center; }
}
`, "utf8");

console.log("  ✅ CSS fixed!");
