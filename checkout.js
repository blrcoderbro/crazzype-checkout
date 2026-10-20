/**
 * CrazzyPe Checkout.js
 * ---------------------------------------------------------------------------
 * Versioning (cache-busting):
 *   Latest (short cache):  https://crazzype.com/checkout.js
   *   Pinned (immutable):    https://crazzype.com/v/4.6.0/checkout.js
 * Bump CHECKOUT_VERSION below, then run: npm run tag:checkout
 * ---------------------------------------------------------------------------
 */

(function () {
  "use strict";

  /** @type {string} Semver — bump this when shipping checkout UI/API changes */
  var CHECKOUT_VERSION = "4.9.2";

  // API Configuration
  var API_BASE_URL =
    window.CRAZZYPE_API_URL || "https://merchants.crazzype.com";

  function normalizeApiBase(url) {
    return String(url || "")
      .trim()
      .replace(/\/+$/, "")
      .replace(/\/api$/i, "");
  }

  function apiOrdersUrl(path) {
    var base = normalizeApiBase(API_BASE_URL);
    var p = path.charAt(0) === "/" ? path : "/" + path;
    return base + p;
  }

  function apiAuthHeaders(apiKey) {
    var headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    };
    try {
      if (typeof window !== "undefined" && window.location && window.location.origin) {
        headers["X-API-Origin"] = window.location.origin;
      }
    } catch (e) {
      /* ignore */
    }
    return headers;
  }

  // Theme Configuration — Razorpay Standard Checkout layout; CrazzyPe brand blue
  var THEME = {
    primary: "#3395ff",
    primaryDark: "#1d6ee8",
    accent: "#3395ff",
    background: "#ffffff",
    foreground: "rgb(0, 10, 26)",
    muted: "rgba(0, 10, 26, 0.7)",
    mutedLight: "#afb6bb",
    border: "#dee1e3",
    borderLight: "#eef0f3",
    surface: "#f5f9ff",
    surfaceActive: "#ffffff",
    success: "#009e5c",
    error: "#e51a45",
    warning: "#f59e0b",
    gradient: "#3395ff",
  };

  // Original artwork, design/checkout-illustrations; standalone SDK embeds its own assets.
  var BAGS_SVG = `<svg viewBox="0 0 240 140" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M31 123h178M52 116V77a6 6 0 0 1 6-6h46M58 78h40M58 88h24M52 103h41"/>
    <path d="m95 118-10-5a6 6 0 0 1-3-8l28-71a6 6 0 0 1 8-3l39 16a6 6 0 0 1 3 8l-17 43M111 41l37 15M96 99l24 10m-11-2 5 2"/>
    <path d="m129 68 11 4-4 10-11-4 4-10Zm-11-4 3 1m-6 7 3 1m5 12 4 2m12-1 3 1"/>
    <path d="m158 84 23 9v17c0 13-16 19-23 22-7-3-23-9-23-22V93l23-9Zm-10 23 7 7 13-14" fill="var(--cp-accent)"/>
    <path d="m66 37 3-8 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM181 51h10m-5-5v10" stroke="var(--cp-accent)"/>
  </svg>`;
  var OFFLINE_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M105 59H82a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4h25a4 4 0 0 1 4 4v14M88 17h13M79 49h24M93 54h3M74 62h68"/>
    <path d="M115 35a23 23 0 0 1 26 4m-23 5a15 15 0 0 1 15 1m-10 7h1m-13 8 32-32" stroke="var(--cp-accent)"/>
  </svg>`;
  var EXIT_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M78 61h50M85 60V13h29v14M114 48v12H85"/><path d="m85 13 20 6v42l-20-7V13Z"/><path d="M99 36v4"/>
    <path d="M113 37h24m-8-8 8 8-8 8" stroke="var(--cp-accent)"/>
  </svg>`;

  var CLOCK_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M116 49a22 22 0 1 1 3-24M109 47a16 16 0 1 1 3-18"/><path d="m91 31 5 5 10-10M78 61h60"/><path d="M137 44a14 14 0 1 1-28 0 14 14 0 0 1 28 0Zm-14-8v8l5 3" stroke="var(--cp-accent)"/></svg>`;
  var HOURGLASS_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="cpz-hourglass-body"><path d="M90 12h36M90 60h36M94 13v9c0 7 8 9 11 14-3 5-11 7-11 14v9m28-46v9c0 7-8 9-11 14 3 5 11 7 11 14v9"/><path d="m100 23 8 8 8-8h-16Zm0 30 8-9 8 9h-16Z" fill="var(--cp-accent)" stroke="var(--cp-accent)"/><path d="M108 35v4" stroke="var(--cp-accent)"/></g></svg>`;
  var FAIL_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M110 60H87a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4h23a4 4 0 0 1 4 4v14M92 17h13M84 49h24M97 55h3M78 63h62"/><path d="M139 44a14 14 0 1 1-28 0 14 14 0 0 1 28 0Zm-19-5 10 10m0-10-10 10" stroke="var(--cp-accent)"/></svg>`;
  var WARNING_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m104 15-24 40a4 4 0 0 0 3 6h50a4 4 0 0 0 3-6l-24-40a5 5 0 0 0-8 0ZM76 64h64"/><path d="M108 29v14m0 7v2" stroke="var(--cp-accent)"/></svg>`;
  // Original rupee line art; five shallow layers give a thin edge without a player or mesh.
  var COIN_FACE_SVG = `<svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="25" cy="25" r="19"/><path d="M18 16h15m-15 5h15m-12-5c9 0 9 11-2 11l12 10M25 3v2m0 40v2"/></svg>`;
  var COIN_SVG = `<div class="cpz-coin-scene" aria-hidden="true"><svg class="cpz-coin-streaks" viewBox="0 0 216 72" fill="none" stroke="var(--cp-primary)" stroke-width="1.5" stroke-linecap="round"><path d="M52 23h27M43 36h32M57 49h22"/></svg><div class="cpz-original-coin"><span class="cpz-coin-edge cpz-coin-edge-back"></span><span class="cpz-coin-edge"></span><span class="cpz-coin-edge cpz-coin-edge-front"></span><span class="cpz-coin-face cpz-coin-front">${COIN_FACE_SVG}</span><span class="cpz-coin-face cpz-coin-back">${COIN_FACE_SVG}</span></div></div>`;
  var SUCCESS_SVG = `<svg viewBox="0 0 216 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="cpz-original-halo" d="M141 36a33 33 0 1 1-66 0 33 33 0 0 1 66 0Z" opacity=".2"/><path class="cpz-original-circle" d="M134 36a26 26 0 1 1-52 0 26 26 0 0 1 52 0Z" fill="currentColor"/><path class="cpz-original-tick" d="m96 36 8 8 17-17" stroke="var(--cp-success)" pathLength="1"/></svg>`;

  var SHIELD_SVG =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="#10b981"/>' +
    '<path d="M8.5 12l2.5 2.5 5-5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  // Embedded Styles
  var STYLES = `
    @font-face {
      font-family: "Inter Checkout";
      src: url("/checkout-assets/fonts/inter-checkout-latin-rupee-532b125f8bec.woff2") format("woff2");
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
    }
    .cpz-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 16px;
      font-family: "Inter Checkout", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
      animation: cpz-fade-in 0.2s ease-out;
      --cp-surface: #fff;
      --cp-surface-10: rgb(245,249,255);
      --cp-ink: rgb(0,10,26);
      --cp-muted: rgba(0,10,26,.70);
      --cp-muted-60: rgba(0,10,26,.60);
      --cp-border: rgba(0,20,51,.10);
      --cp-cta: rgb(0,10,26);
      --cp-error: rgb(235,20,20);
      --cp-danger: rgb(188,16,16);
      --cp-success: #0f9d58;
      --cp-warning: #d97706;
      --cp-scrim: rgba(0,10,26,.40);
      --cp-ease: cubic-bezier(.2,.8,.2,1);
      --cp-primary: ${THEME.primary};
      --cp-accent: var(--cp-primary);
      --cp-primary-hover: color-mix(in srgb, ${THEME.primary} 92%, #000);
      --cp-primary-active: color-mix(in srgb, ${THEME.primary} 85%, #000);
      --cp-primary-soft: color-mix(in srgb, ${THEME.primary} 10%, transparent);
      --cp-on-primary: #ffffff;
    }

    .cpz-overlay.is-light-theme .cpz-rzp-sidebar,
    .cpz-overlay.is-light-theme .cpz-rzp-mob-header {
      color: #111827;
    }

    .cpz-overlay.is-light-theme .cpz-rzp-trust,
    .cpz-overlay.is-light-theme .cpz-rzp-secured {
      color: rgba(17, 24, 39, 0.78);
      opacity: 1;
    }

    .cpz-overlay.is-light-theme .cpz-rzp-user-row {
      background: rgba(17, 24, 39, 0.08);
      color: #111827;
    }

    .cpz-overlay.is-light-theme .cpz-rzp-show-qr {
      color: #111827;
    }

    .cpz-overlay.is-light-theme .cpz-rzp-refresh-btn,
    .cpz-overlay.is-light-theme .cpz-sheet-btn:not(.secondary) {
      color: #111827;
    }

    .cpz-overlay *,
    .cpz-overlay *::before,
    .cpz-overlay *::after {
      box-sizing: border-box;
    }

    .cpz-overlay h1,
    .cpz-overlay h2,
    .cpz-overlay h3,
    .cpz-overlay p,
    .cpz-overlay ul,
    .cpz-overlay ol {
      margin: 0;
    }

    @keyframes cpz-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes cpz-scale-in {
      from { 
        opacity: 0; 
        transform: scale(0.96);
      }
      to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
      }
    }

    @keyframes cpz-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes cpz-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes cpz-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes cpz-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .cpz-modal {
      width: 760px;
      max-width: calc(100vw - 24px);
      height: 584px;
      max-height: calc(100vh - 24px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(15, 23, 32, 0.32);
      overflow: hidden;
      position: relative;
      animation: cpz-scale-in 0.22s ease-out;
      display: flex;
      flex-direction: column;
      padding: 0;
      box-sizing: border-box;
    }

    .cpz-modal.is-checkout-frame {
      background: var(--cp-primary, ${THEME.primary});
      padding: 6px;
    }

    .cpz-modal::before { display: none; }

    .cpz-modal.is-checkout-frame .cpz-close {
      display: none;
    }

    @media (max-width: 767px) {
      .cpz-overlay {
        padding: 0;
        align-items: flex-end;
      }
      .cpz-modal {
        max-width: 100%;
        width: 100%;
        height: 100%;
        max-height: 100dvh;
        border-radius: 0;
      }
    }

    .cpz-close {
      position: absolute;
      top: 10px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: ${THEME.muted};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      z-index: 20;
    }

    .cpz-close:hover {
      background: ${THEME.surface};
      color: ${THEME.foreground};
    }

    .cpz-content {
      padding: 0;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ===== Checkout Frame 2 shell ===== */
    .cpz-rzp-shell {
      display: flex;
      flex-direction: row;
      height: 100%;
      min-height: 0;
      flex: 1;
      border-radius: 12px;
      overflow: hidden;
      background: transparent;
    }

    .cpz-rzp-sidebar {
      width: 296px;
      min-width: 296px;
      box-sizing: border-box;
      background: transparent;
      color: var(--cp-on-primary, #fff);
      padding: 8px 8px 8px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cpz-rzp-side-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    .cpz-rzp-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .cpz-rzp-brand .cpz-logo,
    .cpz-rzp-brand .cpz-logo-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fff;
      color: var(--cp-primary, ${THEME.primary});
      object-fit: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .cpz-rzp-name {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 160px;
    }

    .cpz-rzp-trust {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--cp-on-primary, #fff);
      opacity: 0.92;
    }

    .cpz-rzp-trust svg { width: 12px; height: 12px; flex-shrink: 0; }

    .cpz-rzp-price-card {
      background: rgba(255, 255, 255, 0.92);
      border-radius: 10px;
      padding: 16px;
      color: #0f172a;
    }

    .cpz-rzp-price-card span {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }

    .cpz-rzp-price-card strong {
      display: block;
      margin-top: 4px;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }

    .cpz-rzp-price-desc {
      margin-top: 6px;
      font-size: 13px;
      font-weight: 400;
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cpz-rzp-view-details {
      margin-top: 8px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--cp-primary, ${THEME.primary});
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .cpz-rzp-order-details {
      display: none;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e8ebef;
      font-size: 12px;
      font-weight: 400;
      color: #64748b;
      line-height: 1.45;
      overflow: hidden;
    }

    .cpz-rzp-order-details.is-open {
      display: block;
      animation: cpzDetailsIn 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes cpzDetailsIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .cpz-rzp-user-row {
      background: rgba(255, 255, 255, 0.16);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border: 0;
      width: 100%;
      color: inherit;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }

    .cpz-rzp-user-row:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    .cpz-rzp-user-row-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .cpz-rzp-user-row-left > svg {
      flex-shrink: 0;
      opacity: 0.9;
    }

    .cpz-rzp-user-meta {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 600;
    }

    .cpz-rzp-user-chevron {
      flex-shrink: 0;
      opacity: 0.75;
    }

    .cpz-rzp-prefill-panel {
      display: none;
      background: rgba(255, 255, 255, 0.14);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.45;
    }

    .cpz-rzp-prefill-panel.is-open { display: block; }

    .cpz-rzp-prefill-panel div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.92;
    }

    /* Razorpay-style 3D coin */
    .cpz-coin-stage {
      position: relative;
      width: 96px;
      height: 96px;
      margin: 8px auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 600px;
    }

    .cpz-halo-ring {
      position: absolute;
      width: 86px;
      height: 86px;
      border-radius: 50%;
      border: 2px solid rgba(254, 240, 138, 0.45);
      box-shadow: 0 0 16px rgba(250, 204, 21, 0.28), inset 0 0 10px rgba(250, 204, 21, 0.18);
      animation: cpzHaloPulse 2.2s ease-in-out infinite;
    }

    @keyframes cpzHaloPulse {
      0%, 100% { transform: scale(0.95); opacity: 0.55; }
      50% { transform: scale(1.05); opacity: 0.95; }
    }

    .cpz-3d-coin {
      width: 58px;
      height: 58px;
      position: relative;
      transform-style: preserve-3d;
      animation: cpzCoinSpin 1.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
    }

    @keyframes cpzCoinSpin {
      0% { transform: rotateY(0deg); }
      50% { transform: rotateY(180deg); }
      100% { transform: rotateY(360deg); }
    }

    .cpz-coin-face {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      backface-visibility: hidden;
      background: radial-gradient(circle at 35% 35%, #fff9c4 0%, #fbc02d 42%, #f57f17 82%, #d97706 100%);
      border: 3.5px solid #fff59d;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3), inset 0 1.5px 3px rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cpz-coin-back { transform: rotateY(180deg); }

    .cpz-coin-inner-rim {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 38%, #ffd54f 0%, #fbc02d 55%, #f57f17 100%);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.18);
      position: relative;
      overflow: hidden;
    }

    .cpz-coin-sheen {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 50%);
      pointer-events: none;
    }

    .cpz-status.cpz-coin-status {
      min-height: 360px;
      justify-content: center;
      padding: 40px 28px;
    }

    .cpz-rzp-sidebar-bottom {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: stretch;
      flex: 1;
      min-height: 0;
      justify-content: flex-end;
    }

    .cpz-rzp-bags {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      flex: 1;
      min-height: 72px;
      opacity: 0.95;
      pointer-events: none;
    }

    .cpz-rzp-bags svg {
      width: 100%;
      max-width: 200px;
      height: auto;
    }

    .cpz-rzp-secured {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--cp-on-primary, #fff);
      opacity: 0.88;
      flex-shrink: 0;
    }

    .cpz-rzp-secured svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .cpz-rzp-workspace {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
    }

    .cpz-rzp-topbar {
      height: 56px;
      border-bottom: 1px solid #eef0f3;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      padding: 0 12px;
    }

    .cpz-rzp-topbar-title {
      font-size: 15px;
      font-weight: 600;
      color: #292f32;
      letter-spacing: -0.01em;
    }

    .cpz-rzp-topbar-actions {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .cpz-rzp-icon-btn {
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: #6c849d;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      padding: 0;
    }

    .cpz-rzp-icon-btn:hover {
      background: #f3f4f6;
      color: #292f32;
    }

    .cpz-rzp-menu {
      position: absolute;
      top: 44px;
      right: 8px;
      min-width: 168px;
      background: #fff;
      border: 1px solid #e8ebef;
      border-radius: 10px;
      box-shadow: 0 10px 28px rgba(15, 23, 32, 0.14);
      padding: 6px;
      z-index: 5;
      display: none;
    }

    .cpz-rzp-menu.is-open { display: block; }

    .cpz-rzp-menu button {
      width: 100%;
      border: 0;
      background: transparent;
      text-align: left;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: #292f32;
      cursor: pointer;
      font-family: inherit;
    }

    .cpz-rzp-menu button:hover { background: #f7f9fc; }

    .cpz-rzp-body {
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: hidden;
      background: #f7f9fc;
    }

    .cpz-rzp-methods {
      display: none;
    }

    .cpz-rzp-panel {
      flex: 1;
      min-width: 0;
      padding: 24px;
      overflow-y: auto;
      background: #fff;
    }

    .cpz-rzp-panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
    }

    .cpz-rzp-panel-head-copy {
      min-width: 0;
    }

    .cpz-rzp-panel-head h2 {
      font-size: 16px;
      font-weight: 600;
      color: #292f32;
      margin: 0;
      line-height: 1.3;
    }

    .cpz-rzp-panel-sub {
      margin: 4px 0 0;
      font-size: 13px;
      font-weight: 400;
      color: #6c849d;
      line-height: 1.35;
    }

    .cpz-rzp-timer {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 28px;
      min-width: 78px;
      box-sizing: border-box;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      padding: 0 10px;
      letter-spacing: 0.01em;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .cpz-rzp-timer svg {
      width: 12px;
      height: 12px;
      color: #64748b;
      flex-shrink: 0;
    }

    .cpz-rzp-timer.is-warn {
      color: #b45309;
      background: #fffbeb;
      border-color: #fde68a;
    }

    .cpz-rzp-timer.is-warn svg { color: #d97706; }

    .cpz-rzp-timer.is-danger,
    .cpz-rzp-timer.is-expired {
      color: #b91c1c;
      background: #fef2f2;
      border-color: #fecaca;
    }

    .cpz-rzp-timer.is-danger svg,
    .cpz-rzp-timer.is-expired svg { color: #dc2626; }

    .cpz-upi-hero {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 24px;
      background: #f7f9fc;
      border: 1px solid #e8ebef;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .cpz-upi-hero.is-in {
      opacity: 1;
      transform: translateY(0);
    }

    .cpz-upi-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 0;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1) 60ms, transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1) 60ms;
    }

    .cpz-upi-hero.is-in .cpz-upi-info {
      opacity: 1;
      transform: translateY(0);
    }

    .cpz-upi-amt-label {
      font-size: 12px;
      font-weight: 500;
      color: #6c849d;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 0 0 4px;
    }

    .cpz-upi-amt-value {
      font-size: 28px;
      font-weight: 700;
      color: #292f32;
      margin: 0;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .cpz-upi-merchant {
      margin: 4px 0 0;
      font-size: 13px;
      font-weight: 400;
      color: #6c849d;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    .cpz-upi-divider {
      width: 100%;
      height: 1px;
      background: #e8ebef;
      margin: 12px 0;
      border: 0;
    }

    .cpz-upi-scan-label {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 500;
      color: #292f32;
    }

    .cpz-upi-apps {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .cpz-upi-app-tile {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #e8ebef;
      background: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
    }

    .cpz-upi-app-tile img {
      width: 20px;
      height: 20px;
      object-fit: cover;
      border-radius: 4px;
    }

    .cpz-upi-more {
      height: 32px;
      padding: 0 10px;
      border-radius: 8px;
      border: 1px solid #e8ebef;
      background: #fff;
      font-size: 12px;
      font-weight: 500;
      color: #475569;
      display: inline-flex;
      align-items: center;
    }

    .cpz-upi-hero.is-expired .cpz-upi-apps {
      opacity: 0.4;
    }

    .cpz-upi-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: #eef2f7;
      font-size: 12px;
      font-weight: 500;
      color: #475569;
      margin-bottom: 12px;
    }

    .cpz-upi-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cp-primary, ${THEME.primary});
      animation: cpzStatusPulse 1.6s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes cpzStatusPulse {
      0%, 100% { opacity: 0.35; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1); }
    }

    .cpz-upi-status.is-expired .cpz-upi-status-dot,
    .cpz-upi-status.is-warn .cpz-upi-status-dot {
      animation: none;
      opacity: 1;
    }

    .cpz-upi-status.is-warn .cpz-upi-status-dot { background: #d97706; }
    .cpz-upi-status.is-expired .cpz-upi-status-dot { background: #94a3b8; }

    .cpz-upi-download {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 0;
      background: transparent;
      padding: 0;
      font-size: 12px;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      font-family: inherit;
    }

    .cpz-upi-download:hover { color: #292f32; }

    .cpz-upi-download svg {
      width: 14px;
      height: 14px;
    }

    .cpz-upi-download[hidden] { display: none; }

    .cpz-upi-tile-wrap {
      position: relative;
      flex-shrink: 0;
      width: 212px;
      height: 212px;
      padding: 6px;
    }

    .cpz-upi-brackets {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }

    .cpz-upi-brackets span {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid var(--cp-primary, ${THEME.primary});
    }

    .cpz-upi-brackets .tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
    .cpz-upi-brackets .tr { top: 0; right: 0; border-left: 0; border-bottom: 0; }
    .cpz-upi-brackets .bl { bottom: 0; left: 0; border-right: 0; border-top: 0; }
    .cpz-upi-brackets .br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

    .cpz-upi-tile {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid #e8ebef;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      cursor: zoom-in;
      padding: 0;
      margin: 0;
      display: block;
    }

    .cpz-upi-tile:focus-visible {
      outline: 2px solid var(--cp-primary, ${THEME.primary});
      outline-offset: 2px;
    }

    .cpz-upi-tile img.cpz-upi-qr-img,
    .cpz-upi-tile .cpz-upi-qr-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      transition: filter 180ms ease, opacity 180ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .cpz-upi-tile .cpz-upi-qr-img.is-enter {
      transform: scale(0.98);
      opacity: 0;
    }

    .cpz-upi-tile .cpz-upi-qr-img.is-in {
      transform: scale(1);
      opacity: 1;
    }

    .cpz-upi-scanline {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 2px;
      background: var(--cp-primary, ${THEME.primary});
      opacity: 0.25;
      z-index: 2;
      pointer-events: none;
      animation: cpzScanSweep 2.4s linear infinite;
    }

    @keyframes cpzScanSweep {
      0% { transform: translateY(0); }
      100% { transform: translateY(198px); }
    }

    .cpz-upi-shimmer {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, #eef2f7 0%, #f8fafc 50%, #eef2f7 100%);
      background-size: 200% 100%;
      animation: cpz-shimmer 1.2s ease-in-out infinite;
      z-index: 1;
    }

    .cpz-upi-shimmer::after {
      content: '';
      position: absolute;
      inset: 24px;
      border: 1px dashed #dbe2ea;
      border-radius: 4px;
      opacity: 0.7;
    }

    .cpz-upi-expired {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.72);
      z-index: 4;
      text-align: center;
    }

    .cpz-upi-tile-wrap.is-expired .cpz-upi-expired { display: flex; }
    .cpz-upi-tile-wrap.is-expired .cpz-upi-qr-img {
      filter: blur(6px);
      opacity: 0.4;
    }
    .cpz-upi-tile-wrap.is-expired .cpz-upi-brackets,
    .cpz-upi-tile-wrap.is-expired .cpz-upi-scanline {
      display: none;
    }

    .cpz-upi-expired-clock {
      width: 20px;
      height: 20px;
      color: #64748b;
    }

    .cpz-upi-expired-label {
      font-size: 14px;
      font-weight: 600;
      color: #292f32;
    }

    .cpz-upi-refresh {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      border: 0;
      border-radius: 8px;
      background: var(--cp-primary, ${THEME.primary});
      color: var(--cp-on-primary, #fff);
      font: 600 12px inherit;
      cursor: pointer;
    }

    .cpz-upi-refresh svg { width: 14px; height: 14px; }

    .cpz-upi-refresh.is-loading {
      pointer-events: none;
      opacity: 0.75;
    }

    .cpz-how {
      margin-top: 0;
      padding-top: 16px;
      border-top: 1px solid #eef0f3;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 8px;
    }

    .cpz-how-step {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 400;
      color: #6c849d;
    }

    .cpz-how-num {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cpz-how-chev {
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1;
    }

    .cpz-qr-lightbox {
      position: absolute;
      inset: 0;
      z-index: 40;
      background: rgba(15, 23, 32, 0.55);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      opacity: 0;
      transition: opacity 180ms ease;
    }

    .cpz-qr-lightbox.is-open { opacity: 1; }

    .cpz-qr-lightbox-card {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 24px 48px rgba(15, 23, 32, 0.28);
    }

    .cpz-qr-lightbox-card img {
      width: 320px;
      height: 320px;
      object-fit: contain;
      object-position: center;
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }

    .cpz-rzp-drag-handle {
      display: none;
      width: 100%;
      padding: 10px 0 4px;
      justify-content: center;
      flex-shrink: 0;
      background: var(--cp-primary, ${THEME.primary});
    }

    .cpz-rzp-drag-handle span {
      width: 40px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.45);
    }

    .cpz-rzp-mob-header {
      display: none;
      background: var(--cp-primary, ${THEME.primary});
      color: var(--cp-on-primary, #fff);
      padding: 12px 14px;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .cpz-rzp-mob-header .cpz-logo,
    .cpz-rzp-mob-header .cpz-logo-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #fff;
      color: var(--cp-primary, ${THEME.primary});
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      object-fit: cover;
    }

    .cpz-rzp-mob-amount {
      margin-left: auto;
      text-align: right;
      flex-shrink: 0;
      font-size: 15px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .cpz-rzp-intent-grid {
      display: none;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
      margin-top: 8px;
    }

    .cpz-rzp-intent-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font: 600 13px inherit;
      color: #292f32;
      cursor: pointer;
      padding: 0 12px;
    }

    .cpz-rzp-intent-btn img {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: cover;
    }

    .cpz-rzp-show-qr {
      display: none;
      margin-top: 12px;
      border: 0;
      background: transparent;
      color: var(--cp-primary, ${THEME.primary});
      font: 600 13px inherit;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
      padding: 8px;
    }

    .cpz-rzp-desktop-only { display: block; }
    .cpz-rzp-mobile-only { display: none; }

    @media (max-width: 767px) {
      .cpz-modal {
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 100dvh;
        border-radius: 16px 16px 0 0;
        align-self: flex-end;
        padding: 0;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .cpz-overlay {
        align-items: flex-end;
        padding: 0;
      }
      .cpz-rzp-shell { flex-direction: column; border-radius: 0; }
      .cpz-rzp-sidebar { display: none; }
      .cpz-rzp-drag-handle { display: flex; }
      .cpz-rzp-mob-header { display: flex; }
      .cpz-rzp-workspace { border-radius: 0; }
      .cpz-rzp-topbar { display: none; }
      .cpz-rzp-body { flex-direction: column; overflow-y: auto; background: #fff; }
      .cpz-rzp-panel { padding: 16px; }
      .cpz-upi-hero {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
      }
      .cpz-upi-hero.is-mobile-visible { display: flex; }
      .cpz-upi-info { align-items: center; width: 100%; }
      .cpz-upi-apps { justify-content: center; }
      .cpz-upi-download {
        width: 100%;
        height: 44px;
        justify-content: center;
        border: 1.5px solid #cbd5e1;
        border-radius: 10px;
        background: #fff;
      }
      .cpz-upi-tile-wrap {
        width: 232px;
        height: 232px;
      }
      .cpz-upi-tile,
      .cpz-upi-tile img.cpz-upi-qr-img {
        width: 220px;
        height: 220px;
      }
      .cpz-how {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .cpz-how-chev { display: none; }
      .cpz-rzp-intent-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .cpz-rzp-intent-btn {
        height: 56px;
        flex-direction: column;
        gap: 6px;
      }
      .cpz-rzp-show-qr { display: inline-flex; }
      .cpz-rzp-desktop-only { display: none; }
      .cpz-rzp-mobile-only { display: block; }
      .cpz-close {
        display: flex;
        color: var(--cp-on-primary, #fff);
        top: 10px;
        right: 10px;
      }
      .cpz-close:hover {
        background: rgba(255,255,255,0.18);
        color: var(--cp-on-primary, #fff);
      }
      .cpz-modal.is-checkout-frame .cpz-close { display: flex; }
    }

    /* Header Section */
    .cpz-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid ${THEME.borderLight};
    }

    .cpz-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
      background: ${THEME.borderLight};
      flex-shrink: 0;
    }

    .cpz-logo-placeholder {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: ${THEME.gradient};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .cpz-merchant-info {
      flex: 1;
      min-width: 0;
    }

    .cpz-merchant-name {
      font-size: 17px;
      font-weight: 600;
      color: ${THEME.foreground};
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cpz-verified-badge {
      width: 16px;
      height: 16px;
      background: ${THEME.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cpz-verified-badge svg {
      width: 10px;
      height: 10px;
      color: white;
    }

    .cpz-merchant-desc {
      font-size: 13px;
      color: ${THEME.muted};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Amount Section */
    .cpz-amount-section {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 20px;
      text-align: center;
    }

    .cpz-amount-label {
      font-size: 12px;
      font-weight: 500;
      color: ${THEME.muted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .cpz-amount {
      font-size: 32px;
      font-weight: 700;
      color: ${THEME.foreground};
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }

    .cpz-currency {
      font-size: 20px;
      font-weight: 600;
      color: ${THEME.muted};
    }

    .cpz-order-id {
      font-size: 11px;
      color: ${THEME.mutedLight};
      margin-top: 8px;
      font-family: 'SF Mono', Monaco, monospace;
    }

    /* QR Section */
    .cpz-qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }

    .cpz-qr-container {
      position: relative;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid ${THEME.borderLight};
    }


    .cpz-qr-image {
      width: 180px;
      height: 180px;
      object-fit: contain;
      object-position: center;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      display: block;
    }

    .cpz-qr-loading {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${THEME.borderLight};
      border-radius: 8px;
    }

    .cpz-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid ${THEME.border};
      border-top-color: ${THEME.primary};
      border-radius: 50%;
      animation: cpz-spin 0.8s linear infinite;
    }

    /* Timer Section */
    .cpz-timer-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .cpz-timer-circle {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .cpz-timer-svg {
      transform: rotate(-90deg);
      width: 44px;
      height: 44px;
    }

    .cpz-timer-bg {
      fill: none;
      stroke: ${THEME.borderLight};
      stroke-width: 3;
    }

    .cpz-timer-progress {
      fill: none;
      stroke: ${THEME.primary};
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s linear, stroke 0.3s;
    }

    .cpz-timer-progress.warning {
      stroke: ${THEME.warning};
    }

    .cpz-timer-progress.danger {
      stroke: ${THEME.error};
    }

    .cpz-timer-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: ${THEME.foreground};
      font-family: 'SF Mono', Monaco, monospace;
    }

    .cpz-timer-label {
      font-size: 12px;
      color: ${THEME.muted};
    }

    /* Pay Button */
    .cpz-pay-button {
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      background: ${THEME.gradient};
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
    }

    .cpz-pay-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      background-size: 200% 100%;
      animation: cpz-shimmer 2s infinite;
    }

    .cpz-pay-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .cpz-pay-button:active {
      transform: translateY(0);
    }

    .cpz-pay-button svg {
      width: 18px;
      height: 18px;
    }

    /* UPI Apps */
    .cpz-upi-section {
      margin-bottom: 16px;
    }

    .cpz-upi-label {
      font-size: 11px;
      color: ${THEME.mutedLight};
      text-align: center;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cpz-upi-apps {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cpz-upi-app {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${THEME.borderLight};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .cpz-upi-app:hover {
      transform: translateY(-2px);
      border-color: ${THEME.border};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .cpz-upi-app img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    /* Footer */
    .cpz-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 16px;
      border-top: 1px solid ${THEME.borderLight};
    }

    .cpz-footer-lock {
      width: 12px;
      height: 12px;
      color: ${THEME.primary};
    }

    .cpz-footer-text {
      font-size: 11px;
      color: ${THEME.mutedLight};
    }

    .cpz-footer-brand {
      font-size: 11px;
      color: ${THEME.primary};
      font-weight: 600;
      text-decoration: none;
    }

    /* Razorpay Standard inspired payment frame */
    .cpz-payment-shell { display:grid; grid-template-columns:280px minmax(0,1fr); min-height:560px; background:#fff; }
    .cpz-payment-sidebar { background:linear-gradient(160deg,#3395ff 0%,#1d6ee8 100%); color:#fff; padding:34px 26px; display:flex; flex-direction:column; }
    .cpz-payment-sidebar .cpz-header { border:0; margin:0; padding:0 0 28px; color:#fff; }
    .cpz-payment-sidebar .cpz-merchant-name,.cpz-payment-sidebar .cpz-merchant-desc { color:#fff; }
    .cpz-payment-sidebar .cpz-logo-placeholder { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); }
    .cpz-sidebar-label { font-size:11px; opacity:.72; margin-top:auto; }
    .cpz-sidebar-amount { font-size:28px; font-weight:700; margin-top:4px; }
    .cpz-payment-main { display:flex; flex-direction:column; min-width:0; }
    .cpz-payment-title { padding:28px 30px 18px; font-size:18px; font-weight:700; color:#0a2540; border-bottom:1px solid #e6ebf1; }
    .cpz-payment-body { display:grid; grid-template-columns:205px minmax(0,1fr); flex:1; }
    .cpz-methods { padding:18px 12px; background:#f7f9fc; border-right:1px solid #e6ebf1; }
    .cpz-method { width:100%; border:0; border-left:3px solid #3395ff; background:#fff; padding:15px 13px; text-align:left; cursor:pointer; box-shadow:0 1px 3px rgba(10,37,64,.08); }
    .cpz-method-title { display:flex; align-items:center; gap:8px; color:#0a2540; font-size:13px; font-weight:700; }
    .cpz-method-sub { color:#6b7c93; font-size:10px; margin:6px 0 8px; }
    .cpz-method-apps { color:#3395ff; font-size:10px; font-weight:700; letter-spacing:.02em; }
    .cpz-payment-workspace { padding:22px 28px; overflow:auto; }
    .cpz-scan-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; color:#0a2540; font-size:15px; font-weight:700; }
    .cpz-scan-panel { border:1px solid #e6ebf1; padding:18px; display:grid; grid-template-columns:auto 1fr; gap:22px; align-items:center; }
    .cpz-scan-copy h3 { font-size:14px; color:#0a2540; margin-bottom:10px; }
    .cpz-scan-copy ol { padding-left:18px; color:#6b7c93; font-size:11px; line-height:1.8; }
    .cpz-payment-workspace .cpz-qr-section { margin:0; }
    .cpz-payment-workspace .cpz-qr-container { width:188px; height:188px; }
    .cpz-payment-workspace .cpz-qr-image { width:164px; height:164px; }
    .cpz-payment-actions { margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .cpz-payment-actions .cpz-pay-button { margin:0; background:#3395ff; border-radius:4px; box-shadow:none; }
    .cpz-payment-actions .cpz-upi-section { margin:0; }
    .cpz-payment-workspace .cpz-footer { margin-top:16px; }
    @media(max-width:720px) {
      .cpz-payment-shell { display:block; min-height:0; }
      .cpz-payment-sidebar { padding:22px 22px 16px; }
      .cpz-payment-sidebar .cpz-header { padding-bottom:14px; }
      .cpz-sidebar-label,.cpz-sidebar-amount { display:none; }
      .cpz-payment-title { padding:16px 20px 12px; font-size:16px; }
      .cpz-payment-body { display:block; }
      .cpz-methods { border:0; border-bottom:1px solid #e6ebf1; padding:10px 16px; }
      .cpz-method { padding:11px 12px; }
      .cpz-method-sub,.cpz-method-apps { display:inline; margin-right:5px; }
      .cpz-payment-workspace { padding:16px; }
      .cpz-scan-panel { display:block; text-align:center; }
      .cpz-scan-copy { margin-top:12px; text-align:left; }
      .cpz-payment-actions { grid-template-columns:1fr; }
    }

    /* Status States */
    .cpz-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .cpz-status-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .cpz-status-icon.success {
      background: rgba(34, 197, 94, 0.1);
      color: ${THEME.success};
    }

    .cpz-status-icon.error {
      background: rgba(239, 68, 68, 0.1);
      color: ${THEME.error};
    }

    .cpz-status-icon.processing {
      background: rgba(59, 130, 246, 0.1);
      color: ${THEME.accent};
    }

    .cpz-status-icon svg {
      width: 32px;
      height: 32px;
    }

    .cpz-status-title {
      font-size: 18px;
      font-weight: 600;
      color: ${THEME.foreground};
      margin-bottom: 8px;
    }

    .cpz-status-message {
      font-size: 14px;
      color: ${THEME.muted};
      margin-bottom: 20px;
    }

    .cpz-status-button {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      background: ${THEME.primary};
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cpz-status-button:hover {
      background: ${THEME.primaryDark};
    }

    .cpz-status-button.secondary {
      background: ${THEME.borderLight};
      color: ${THEME.foreground};
    }

    .cpz-status-button.secondary:hover {
      background: ${THEME.border};
    }

    /* Processing Animation */
    .cpz-processing-dots {
      display: flex;
      gap: 6px;
      margin-top: 16px;
    }

    .cpz-processing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${THEME.accent};
      animation: cpz-bounce 0.6s ease-in-out infinite;
    }

    .cpz-processing-dot:nth-child(2) {
      animation-delay: 0.1s;
    }

    .cpz-processing-dot:nth-child(3) {
      animation-delay: 0.2s;
    }

    /* BharatPe UTR modal (inside checkout overlay — not window.prompt) */
    .cpz-utr-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30;
      padding: 16px;
      animation: cpz-fade-in 0.2s ease-out;
    }

    .cpz-utr-card {
      width: 100%;
      max-width: 390px;
      background: ${THEME.background};
      border: 1px solid ${THEME.border};
      border-radius: 16px;
      padding: 22px;
      box-shadow:
        0 20px 44px rgba(15, 23, 42, 0.34),
        0 1px 0 rgba(255, 255, 255, 0.35) inset;
      animation: cpz-scale-in 0.25s ease-out;
    }

    .cpz-utr-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 4px;
    }

    .cpz-utr-title {
      font-size: 18px;
      font-weight: 700;
      color: ${THEME.foreground};
      margin: 0;
    }

    .cpz-utr-pill {
      border: 1px solid rgba(37, 99, 235, 0.24);
      background: rgba(37, 99, 235, 0.1);
      color: #1d4ed8;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
    }

    .cpz-utr-desc {
      font-size: 13px;
      color: ${THEME.muted};
      line-height: 1.45;
      margin-bottom: 16px;
    }

    .cpz-utr-input {
      width: 100%;
      border: 1px solid ${THEME.border};
      border-radius: 12px;
      padding: 12px 13px;
      font-size: 14px;
      font-family: 'SF Mono', Monaco, monospace;
      letter-spacing: 0.02em;
      color: ${THEME.foreground};
      background: ${THEME.background};
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .cpz-utr-input:focus {
      border-color: ${THEME.primary};
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
    }

    .cpz-utr-hint {
      font-size: 12px;
      color: ${THEME.mutedLight};
      margin-top: 8px;
      min-height: 18px;
    }

    .cpz-utr-hint.error {
      color: ${THEME.error};
    }

    .cpz-utr-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 18px;
    }

    .cpz-utr-actions .cpz-status-button {
      min-width: 124px;
      border-radius: 12px;
      padding: 11px 16px;
    }

    .cpz-utr-actions .cpz-status-button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    /* ===== Persistent stage + Frame 1 loader ===== */
    .cpz-stage {
      position: relative;
      flex: 1;
      min-height: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #f3f4f6;
      border-radius: 12px;
    }

    .cpz-modal.is-checkout-frame .cpz-stage {
      background: transparent;
      border-radius: 0;
    }

    .cpz-frame-loader {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: inherit;
      opacity: 1;
      transition: opacity 200ms ease;
      pointer-events: auto;
    }

    .cpz-frame-loader.is-exit {
      opacity: 0;
      pointer-events: none;
    }

    .cpz-frame-loader.is-hidden {
      display: none;
    }

    .cpz-loader-shield {
      width: 72px;
      height: 72px;
      color: var(--cp-primary, ${THEME.primary});
      filter: drop-shadow(0 8px 24px var(--cp-primary-soft, rgba(51,149,255,0.25)));
      animation: cpzLoaderPulse 1.6s ease-in-out infinite;
    }

    .cpz-loader-shield svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    @keyframes cpzLoaderPulse {
      0%, 100% { transform: scale(0.96); opacity: 0.82; }
      50% { transform: scale(1.04); opacity: 1; }
    }

    .cpz-loader-secured {
      position: absolute;
      bottom: 22px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }

    .cpz-loader-secured svg {
      width: 14px;
      height: 14px;
    }

    .cpz-checkout-mount {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transition: opacity 200ms ease;
    }

    .cpz-checkout-mount.is-visible {
      opacity: 1;
    }

    .cpz-checkout-mount .cpz-rzp-shell {
      flex: 1;
    }

    .cpz-rzp-workspace {
      position: relative;
    }

    .cpz-shell-dimmed .cpz-rzp-sidebar,
    .cpz-shell-dimmed .cpz-rzp-mob-header,
    .cpz-shell-dimmed .cpz-rzp-workspace > *:not(.cpz-sheet-host) {
      opacity: 0.4;
      transition: opacity 220ms ease;
      pointer-events: none;
    }

    /* ===== Right-pane sheets (Frames 3–6, fail/cancel) ===== */
    .cpz-sheet-host {
      position: absolute;
      inset: 0;
      z-index: 8;
      pointer-events: none;
      overflow: hidden;
      border-radius: inherit;
    }

    .cpz-sheet {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 70%;
      background: #fff;
      border-radius: 16px 16px 0 0;
      box-shadow: 0 -8px 32px rgba(15, 23, 32, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 24px 20px;
      pointer-events: auto;
      transform: translateY(110%);
      opacity: 1;
      transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), height 240ms ease;
      will-change: transform;
    }

    .cpz-sheet.is-open {
      transform: translateY(0);
    }

    .cpz-sheet.is-full {
      height: 100%;
      border-radius: 0;
    }

    .cpz-sheet.is-success {
      background: #0f9d58;
      color: #fff;
    }

    .cpz-sheet-title {
      font-size: 18px;
      font-weight: 600;
      color: #292f32;
      margin: 0 0 6px;
      text-align: center;
      transition: opacity 150ms ease;
    }

    .cpz-sheet.is-success .cpz-sheet-title {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
    }

    .cpz-sheet-sub {
      font-size: 13px;
      color: #6c849d;
      margin: 0 0 18px;
      text-align: center;
      line-height: 1.4;
    }

    .cpz-sheet.is-success .cpz-sheet-sub {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      margin-bottom: 10px;
    }

    .cpz-sheet-live {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 4px;
      text-align: center;
    }

    .cpz-sheet-coin-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0 20px;
    }

    .cpz-sheet-coin-wrap .cpz-coin-stage {
      margin: 0;
    }

    .cpz-ripple {
      position: absolute;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2px solid rgba(251, 191, 36, 0.45);
      opacity: 0;
      pointer-events: none;
    }

    .cpz-sheet.is-confirming .cpz-ripple {
      animation: cpzRipple 1.6s ease-out infinite;
    }

    .cpz-sheet.is-confirming .cpz-ripple:nth-child(2) {
      animation-delay: 0.35s;
    }

    .cpz-sheet.is-confirming .cpz-ripple:nth-child(3) {
      animation-delay: 0.7s;
    }

    @keyframes cpzRipple {
      0% { transform: scale(1); opacity: 0.55; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .cpz-sheet-coin-wrap.is-exit .cpz-3d-coin {
      animation: none;
      transform: translateX(140%) scale(0.85);
      opacity: 0;
      transition: transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 450ms ease;
    }

    .cpz-streaks {
      position: absolute;
      left: 8px;
      right: 40%;
      top: 50%;
      height: 10px;
      transform: translateY(-50%);
      pointer-events: none;
      opacity: 0;
    }

    .cpz-sheet-coin-wrap.is-exit .cpz-streaks {
      opacity: 1;
    }

    .cpz-streaks span {
      display: block;
      height: 2px;
      margin: 2px 0;
      border-radius: 2px;
      background: linear-gradient(90deg, transparent, var(--cp-primary, ${THEME.primary}), #fff);
      transform-origin: right center;
      animation: cpzStreak 450ms ease forwards;
    }

    .cpz-streaks span:nth-child(2) { width: 85%; animation-delay: 40ms; }
    .cpz-streaks span:nth-child(3) { width: 70%; animation-delay: 80ms; }

    @keyframes cpzStreak {
      from { transform: scaleX(0.2); opacity: 0; }
      to { transform: scaleX(1); opacity: 0.9; }
    }

    .cpz-sheet-cancel {
      margin-top: auto;
      width: 100%;
      max-width: 320px;
      height: 44px;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      background: #fff;
      color: #292f32;
      font: 600 14px inherit;
      cursor: pointer;
    }

    .cpz-sheet-cancel:hover {
      background: #f8fafc;
    }

    .cpz-sheet-cancel[hidden] {
      display: none;
    }

    .cpz-sheet-secured {
      margin-top: auto;
      display: none;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }

    .cpz-sheet.is-confirming .cpz-sheet-secured,
    .cpz-sheet.is-success .cpz-sheet-secured {
      display: flex;
    }

    .cpz-sheet.is-success .cpz-sheet-secured {
      color: rgba(255, 255, 255, 0.88);
    }

    .cpz-success-badge {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0 18px;
      transform: scale(0.6);
      opacity: 0;
    }

    .cpz-sheet.is-success .cpz-success-badge.is-in {
      animation: cpzBadgeIn 600ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes cpzBadgeIn {
      to { transform: scale(1); opacity: 1; }
    }

    .cpz-success-badge svg {
      width: 44px;
      height: 44px;
      stroke: #0f9d58;
      stroke-width: 3;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .cpz-success-badge .cpz-tick {
      stroke-dasharray: 36;
      stroke-dashoffset: 36;
    }

    .cpz-success-badge.is-in .cpz-tick {
      animation: cpzTickDraw 400ms ease 200ms forwards;
    }

    @keyframes cpzTickDraw {
      to { stroke-dashoffset: 0; }
    }

    .cpz-receipt {
      width: 100%;
      max-width: 340px;
      background: rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      padding: 14px 16px;
      color: #fff;
      text-align: left;
      margin-bottom: 12px;
    }

    .cpz-receipt-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
      margin-bottom: 8px;
    }

    .cpz-receipt-row strong {
      font-size: 14px;
      font-weight: 700;
    }

    .cpz-receipt-row span {
      font-size: 14px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .cpz-receipt-meta {
      font-size: 12px;
      opacity: 0.85;
      margin-bottom: 8px;
    }

    .cpz-receipt-pay {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      font-family: 'SF Mono', Monaco, monospace;
      opacity: 0.95;
      margin-bottom: 8px;
      word-break: break-all;
    }

    .cpz-receipt-copy {
      flex-shrink: 0;
      border: 0;
      background: rgba(255,255,255,0.2);
      color: #fff;
      border-radius: 6px;
      padding: 4px 8px;
      font: 600 12px inherit;
      cursor: pointer;
    }

    .cpz-receipt-foot {
      font-size: 13px;
      font-weight: 400;
      opacity: 0.85;
      line-height: 1.45;
    }

    .cpz-support-block {
      width: 100%;
      max-width: 320px;
      margin: 0 0 16px;
      text-align: center;
    }

    .cpz-support-line {
      font-size: 13px;
      font-weight: 400;
      color: #6c849d;
      line-height: 1.45;
      margin: 0 0 8px;
    }

    .cpz-support-links {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .cpz-support-links a {
      font-size: 13px;
      font-weight: 500;
      color: var(--cp-primary, ${THEME.primary});
      text-decoration: none;
      word-break: break-all;
    }

    .cpz-support-links a:hover {
      text-decoration: underline;
    }

    .cpz-sheet.is-success .cpz-support-line {
      color: rgba(255, 255, 255, 0.85);
    }

    .cpz-sheet.is-success .cpz-support-links a {
      color: #fff;
    }

    .cpz-pay-id-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      margin: 0 0 16px;
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      font-variant-numeric: tabular-nums;
    }

    .cpz-sheet.is-success .cpz-pay-id-row {
      color: rgba(255, 255, 255, 0.9);
    }

    .cpz-pay-id-copy {
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #334155;
      border-radius: 6px;
      padding: 4px 8px;
      font: 600 12px inherit;
      cursor: pointer;
      font-family: inherit;
    }

    .cpz-sheet.is-success .cpz-pay-id-copy {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }

    .cpz-receipt-download {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 8px 0 0;
      border: 0;
      background: transparent;
      padding: 0;
      font-size: 12px;
      font-weight: 500;
      color: inherit;
      opacity: 0.9;
      cursor: pointer;
      font-family: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .cpz-sheet-actions {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: auto;
    }

    .cpz-sheet-btn,
    .cpz-rzp-refresh-btn,
    .cpz-rzp-intent-btn,
    .cpz-sheet-cancel {
      height: 44px;
      border-radius: 10px;
      font-family: inherit;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: transform 150ms ease, opacity 150ms ease, background 150ms ease;
    }

    .cpz-sheet-btn {
      border: 0;
      background: var(--cp-primary, ${THEME.primary});
      color: var(--cp-on-primary, #fff);
      width: 100%;
    }

    .cpz-sheet-btn:hover {
      background: var(--cp-primary-hover, ${THEME.primaryDark});
    }

    .cpz-sheet-btn:active,
    .cpz-rzp-refresh-btn:active,
    .cpz-rzp-intent-btn:active,
    .cpz-sheet-cancel:active {
      transform: scale(0.98);
    }

    .cpz-sheet-btn:focus-visible,
    .cpz-rzp-refresh-btn:focus-visible,
    .cpz-rzp-intent-btn:focus-visible,
    .cpz-sheet-cancel:focus-visible,
    .cpz-rzp-icon-btn:focus-visible,
    .cpz-close:focus-visible,
    .cpz-rzp-user-row:focus-visible {
      outline: 2px solid var(--cp-primary, ${THEME.primary});
      outline-offset: 2px;
    }

    .cpz-sheet-btn:disabled,
    .cpz-rzp-refresh-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .cpz-sheet-btn.is-loading {
      position: relative;
      color: transparent;
      pointer-events: none;
    }

    .cpz-sheet-btn.is-loading::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 18px;
      height: 18px;
      margin: -9px 0 0 -9px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: cpz-spin 0.7s linear infinite;
    }

    .cpz-sheet-btn.secondary {
      background: #fff;
      border: 1.5px solid #cbd5e1;
      color: #292f32;
    }

    .cpz-sheet-btn.secondary:hover {
      background: #f8fafc;
    }

    .cpz-sheet-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0 16px;
      font-size: 28px;
    }

    .cpz-sheet-icon.is-fail {
      background: #fef2f2;
      color: #dc2626;
    }

    .cpz-sheet-icon.is-warn {
      background: #fffbeb;
      color: #d97706;
    }

    .cpz-aria-live {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }

    @media (max-width: 767px) {
      .cpz-modal.is-checkout-frame {
        padding: 0;
        border-radius: 16px 16px 0 0;
        height: min(92dvh, 640px);
        max-height: 92dvh;
        align-self: flex-end;
        width: 100%;
        max-width: 100%;
      }

      .cpz-stage {
        border-radius: 16px 16px 0 0;
      }

      .cpz-rzp-shell {
        border-radius: 0;
      }

      .cpz-sheet {
        border-radius: 16px 16px 0 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cpz-overlay,
      .cpz-modal,
      .cpz-frame-loader,
      .cpz-checkout-mount,
      .cpz-sheet,
      .cpz-loader-shield,
      .cpz-3d-coin,
      .cpz-halo-ring,
      .cpz-ripple,
      .cpz-streaks span,
      .cpz-success-badge,
      .cpz-success-badge .cpz-tick,
      .cpz-spinner,
      .cpz-rzp-qr-shimmer,
      .cpz-upi-shimmer,
      .cpz-upi-scanline,
      .cpz-upi-status-dot,
      .cpz-sheet-btn.is-loading::after {
        animation: none !important;
        transition: opacity 100ms ease !important;
      }

      .cpz-upi-hero,
      .cpz-upi-info {
        transform: none !important;
        transition: opacity 100ms ease !important;
      }

      .cpz-sheet {
        transform: none;
      }

      .cpz-sheet:not(.is-open) {
        opacity: 0;
        pointer-events: none;
      }

      .cpz-sheet.is-open {
        opacity: 1;
      }

      .cpz-sheet-coin-wrap.is-exit .cpz-3d-coin {
        transform: none;
        opacity: 0;
        transition: opacity 100ms ease !important;
      }

      .cpz-sheet-btn:active,
      .cpz-rzp-refresh-btn:active,
      .cpz-rzp-intent-btn:active,
      .cpz-sheet-cancel:active {
        transform: none;
      }
    }
    /* Phase 1 tokens and locked UPI-only layout. Other payment methods are not exposed by this SDK. */
    .cpz-overlay *, .cpz-overlay *::before, .cpz-overlay *::after { box-sizing: border-box; }
    .cpz-overlay { color: var(--cp-ink); font-variant-numeric: tabular-nums; }
    .cpz-modal { width: 880px; height: 584px; border-radius: 12px; padding: 6px; background: var(--cp-primary); animation: cpz-scale-in 220ms var(--cp-ease); }
    .cpz-stage, .cpz-frame-loader { background: var(--cp-surface); }
    .cpz-overlay button, .cpz-overlay input, .cpz-overlay a { font-family: inherit; }
    .cpz-order-id, .cpz-timer-text, .cpz-upi-label, .cpz-footer-text, .cpz-footer-brand, .cpz-utr-pill, .cpz-coin-caption { font-size: 12px; }
    .cpz-overlay [hidden] { display: none; }
    .cpz-overlay button:focus-visible, .cpz-overlay a:focus-visible { outline: 2px solid var(--cp-primary); outline-offset: 2px; }
    .cpz-overlay button:active { transform: scale(.98); }
    .cpz-overlay button:disabled { opacity: .5; cursor: not-allowed; }
    .cpz-rzp-trust, .cpz-rzp-secured, .cpz-rzp-price-desc { font-size: 12px; font-weight: 400; }
    .cpz-rzp-trust { display: inline-flex; border-radius: 9999px; padding: 4px 8px; background: rgba(255,255,255,.12); max-width: 100%; }
    .cpz-rzp-brand > div:last-child { min-width: 0; }
    .cpz-rzp-secured { opacity: .7; }
    .cpz-rzp-price-card { border-radius: 12px; padding: 16px; }
    .cpz-rzp-price-card span { font-size: 14px; font-weight: 400; color: var(--cp-muted); }
    .cpz-rzp-price-card strong { font-size: 20px; font-weight: 600; color: var(--cp-ink); }
    .cpz-rzp-price-desc { color: var(--cp-muted); white-space: normal; overflow-wrap: anywhere; }
    .cpz-rzp-name { max-width: 100%; white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    .cpz-rzp-sidebar { width: 280px; min-width: 280px; }
    .cpz-rzp-user-row { min-height: 40px; height: 40px; border-radius: 8px; background: color-mix(in srgb, var(--cp-primary) 15%, #fff); color: var(--cp-ink); }
    .is-light-theme .cpz-rzp-user-row { background: #f1f3f5; }
    .cpz-rzp-prefill-panel { border-radius: 8px; min-width: 0; max-width: 100%; overflow: hidden; }
    .cpz-rzp-prefill-panel > div { min-width: 0; max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
    .cpz-rzp-sidebar-bottom { justify-content: center; }
    .cpz-rzp-bags { flex: 1 1 auto; height: auto; max-height: 160px; min-height: 72px; --cp-accent: color-mix(in srgb, var(--cp-primary) 30%, #fff); }
    .cpz-rzp-bags svg { max-height: 160px; max-width: 240px; }
    .cpz-rzp-topbar { border-color: var(--cp-border); }
    .cpz-rzp-topbar-title { font-size: 14px; color: var(--cp-muted); }
    .cpz-rzp-icon-btn { border: 1px solid var(--cp-border); background: var(--cp-surface); color: var(--cp-muted); position: relative; width: 28px; height: 28px; }
    .cpz-rzp-icon-btn::after { content: ''; position: absolute; inset: -2px; }
    .cpz-rzp-topbar-actions { gap: 8px; }
    .cpz-rzp-panel { padding: 20px; }
    .cpz-rzp-panel-head { align-items: center; gap: 8px; }
    .cpz-rzp-panel-head h2 { font-size: 14px; color: var(--cp-ink); }
    .cpz-rzp-timer, .cpz-rzp-timer.is-warn, .cpz-rzp-timer.is-danger { width: 64px; min-width: 64px; height: 24px; border: 0; padding: 0 8px; gap: 4px; background: var(--cp-surface-10); color: var(--cp-muted-60); font-size: 12px; font-weight: 400; }
    .cpz-rzp-timer svg, .cpz-rzp-timer.is-danger svg { color: var(--cp-muted-60); }
    .cpz-rzp-timer.is-danger #cpz-rzp-timer-text { color: var(--cp-danger); }
    .cpz-rzp-timer.is-expired { visibility: hidden; }
    .cpz-upi-hero { border: 0; background: var(--cp-surface-10); border-radius: 12px; padding: 16px; gap: 16px; flex-wrap: wrap; }
    .cpz-upi-info { min-width: 220px; opacity: 1; transform: none; }
    .cpz-upi-amt-value, .cpz-upi-scan-label { color: var(--cp-ink); }
    .cpz-upi-amt-label, .cpz-upi-merchant, .cpz-how { color: var(--cp-muted); }
    .cpz-upi-tile-wrap { width: 184px; height: 184px; padding: 0; }
    .cpz-upi-tile { width: 184px; height: 184px; border-radius: 8px; border-color: var(--cp-border); overflow: hidden; }
    .cpz-upi-tile img { image-rendering: pixelated; image-rendering: crisp-edges; }
    .cpz-upi-hero, .cpz-upi-info, .cpz-checkout-mount, .cpz-frame-loader { transition-timing-function: var(--cp-ease); }
    .cpz-upi-hero, .cpz-upi-info { transition-duration: 300ms; }
    .cpz-upi-tile .cpz-upi-qr-img { width: 100%; height: 100%; object-fit: contain; object-position: center; }
    .cpz-upi-scanline { left: 0; right: 0; opacity: .25; background: var(--cp-ink); animation-duration: 2.4s; }
    .cpz-upi-shimmer { overflow: hidden; background: #eef2f7; animation: none; }
    .cpz-upi-shimmer::after { inset: 0; border: 0; border-radius: 0; opacity: 1; background: linear-gradient(90deg, transparent, #fff, transparent); animation: cpz-qr-shimmer 1.2s ease-in-out infinite; }
    @keyframes cpz-qr-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    .cpz-upi-status { background: transparent; padding: 0; height: auto; min-height: 24px; color: var(--cp-muted); }
    .cpz-upi-status-dot { width: 6px; height: 6px; background: var(--cp-muted-60); }
    .cpz-upi-expired { inset: 0; border-radius: 8px; background: var(--cp-scrim); backdrop-filter: none; gap: 0; }
    .cpz-upi-expired-clock, .cpz-upi-expired-label { display: none; }
    .cpz-upi-tile-wrap.is-expired .cpz-upi-qr-img { filter: none; opacity: 1; }
    .cpz-upi-refresh { border-radius: 9999px; background: var(--cp-cta); color: #fff; border: 0; font-size: 12px; }
    .cpz-upi-hero.is-expired .cpz-upi-apps { opacity: .4; }
    .cpz-upi-download { color: var(--cp-primary); }
    .cpz-how { border-top: 1px solid var(--cp-border); padding-top: 16px; font-size: 12px; gap: 8px; flex-wrap: wrap; }
    .cpz-how-step, .cpz-how-num { font-size: 12px; }
    .cpz-qr-lightbox-card { width: 320px; max-width: calc(100vw - 32px); border-radius: 12px; }
    .cpz-qr-lightbox-card img { width: 100%; height: auto; }
    .cpz-rzp-menu { width: 288px; max-width: calc(100vw - 32px); padding: 24px; border-radius: 8px; border-color: var(--cp-border); z-index: 30; }
    .cpz-rzp-menu.is-open { animation: cpz-fade-in 250ms var(--cp-ease); }
    .cpz-rzp-menu > strong { display: block; font-size: 14px; margin-bottom: 16px; }
    .cpz-rzp-menu button { display: flex; align-items: center; gap: 12px; padding: 12px 0; font-size: 14px; color: var(--cp-ink); }
    .cpz-rzp-menu button > span:nth-child(2) { flex: 1; min-width: 0; }
    .cpz-rzp-menu small { display: block; overflow-wrap: anywhere; font-size: 12px; color: var(--cp-muted); margin-top: 4px; }
    .cpz-rzp-menu .cpz-menu-close { position: absolute; right: 8px; top: 8px; width: 28px; height: 28px; padding: 0; justify-content: center; }
    .cpz-menu-policies > a { display: none; font-size: 12px; color: var(--cp-primary); padding: 8px; }
    .cpz-menu-policies.is-expanded > a { display: inline-block; }
    .cpz-sheet-btn, .cpz-status-button, .cpz-pay-button, .cpz-rzp-refresh-btn, .cpz-rzp-mob-continue { background: var(--cp-cta); color: #fff; border-radius: 8px; }
    .cpz-sheet-btn:hover, .cpz-status-button:hover { background: var(--cp-cta); opacity: .9; }
    .cpz-sheet-btn.secondary { background: #fff; color: var(--cp-ink); border: 1px solid rgba(0,10,26,.4); }
    .cpz-illustration { width: 216px; height: 72px; flex-shrink: 0; border-radius: 8px; background: var(--cp-surface-10); color: var(--cp-ink); --cp-accent: var(--cp-primary); }
    .cpz-native-animation { width: 96px; height: 96px; display: block; margin: -12px auto; }
    .cpz-offline-art { --cp-accent: var(--cp-muted-60); }
    .cpz-sheet-scrim { position: absolute; inset: 0; background: var(--cp-scrim); z-index: 6; pointer-events: auto; }
    .cpz-sheet-scrim[hidden] { display: none; }
    .cpz-sheet-host { z-index: 8; overflow: visible; }
    .cpz-rzp-workspace { overflow: visible; }
    .cpz-shell-dimmed .cpz-rzp-sidebar, .cpz-shell-dimmed .cpz-rzp-mob-header, .cpz-shell-dimmed .cpz-rzp-workspace > *:not(.cpz-sheet-host) { opacity: 1; }
    .cpz-interruption { padding: 24px; gap: 0; height: auto; max-height: 60%; min-height: 0; opacity: 0; transform: translateY(8px); border-radius: 12px 12px 0 0; transition: opacity 250ms var(--cp-ease), transform 250ms var(--cp-ease); }
    .cpz-interruption.is-open { opacity: 1; transform: translateY(0); }
    .cpz-interruption .cpz-sheet-title { font-size: 20px; font-weight: 600; color: var(--cp-ink); margin: 16px 0 4px; }
    .cpz-interruption .cpz-sheet-sub { font-size: 14px; color: var(--cp-muted); margin: 0 0 12px; max-width: 343px; }
    .cpz-interruption .cpz-sheet-actions { margin-top: 8px; gap: 8px; max-width: 343px; }
    .cpz-interruption > button { max-width: 343px; }
    @media(min-width:768px) {
      .cpz-upi-hero { flex-wrap: nowrap; align-items: center; }
      .cpz-upi-info { min-width: 0; }
      .cpz-upi-info > * { min-width: 0; max-width: 100%; }
      .cpz-upi-amt-value, .cpz-upi-scan-label, .cpz-upi-status-text { white-space: normal; overflow-wrap: anywhere; }
      .cpz-upi-apps { justify-content: flex-start; gap: 8px; }
      .cpz-upi-app-tile { flex-shrink: 0; }
      .cpz-upi-download { white-space: normal; }
      .cpz-upi-download svg { flex-shrink: 0; }
    }
    .cpz-interruption { overflow-y: auto; justify-content: center; }
    .cpz-interruption > .cpz-illustration,
    .cpz-interruption > .cpz-sheet-title,
    .cpz-interruption > .cpz-sheet-sub,
    .cpz-interruption > details,
    .cpz-interruption > .cpz-pay-id-row,
    .cpz-interruption > .cpz-support-block,
    .cpz-interruption > .cpz-last-checked,
    .cpz-interruption > .cpz-sheet-actions,
    .cpz-interruption > .cpz-sheet-secured { width: 100%; max-width: 343px; align-self: center; }
    .cpz-interruption > .cpz-illustration { max-width: 160px; height: 72px; }
    .cpz-interruption .cpz-support-line, .cpz-last-checked { color: var(--cp-muted-60); font-size: 12px; }
    .cpz-interruption .cpz-support-links a { color: var(--cp-primary); }
    .cpz-modal[data-cpz-state="confirming"] .cpz-rzp-timer,
    .cpz-modal[data-cpz-state="pending"] .cpz-rzp-timer,
    .cpz-modal[data-cpz-state="success"] .cpz-rzp-timer { opacity: 0; visibility: hidden; transition: opacity 150ms var(--cp-ease), visibility 0s 150ms; }
    .cpz-interruption .cpz-sheet-sub { flex-shrink: 0; }
    .cpz-interruption > details { width: 100%; max-width: 343px; font-size: 12px; margin: 0 0 12px; overflow-wrap: anywhere; }
    .cpz-interruption .cpz-pay-id-row { margin-bottom: 12px; max-width: 343px; overflow-wrap: anywhere; }
    .cpz-interruption .cpz-support-block { margin-bottom: 12px; }
    .cpz-last-checked { font-size: 12px; color: var(--cp-muted); margin: 0 0 12px; }
    .cpz-sheet-host:has(.cpz-interruption)::before { content: ''; position: absolute; inset: 0; }
    .cpz-stage > .cpz-sheet-host:has(.cpz-interruption)::before { background: var(--cp-scrim); }
    .cpz-coin-scene { position: relative; width: 216px; height: 72px; perspective: 500px; }
    .cpz-original-coin { position: absolute; left: 85px; top: 11px; width: 50px; height: 50px; transform-style: preserve-3d; animation: cpz-original-spin 1.5s linear infinite; }
    .cpz-coin-face, .cpz-coin-edge { position: absolute; inset: 0; border-radius: 50%; background: linear-gradient(135deg, #fff0a3, #eab52d 45%, #b77513 75%, #f5d76d); border: 1px solid #b77513; }
    .cpz-coin-face { color: #82500d; backface-visibility: hidden; box-shadow: inset 0 0 0 2px #f9dc78; }
    .cpz-coin-face svg { width: 100%; height: 100%; }
    .cpz-coin-front { transform: translateZ(2px); }
    .cpz-coin-back { transform: rotateY(180deg) translateZ(2px); }
    .cpz-coin-edge { background: #bd821c; }
    .cpz-coin-edge-back { transform: translateZ(-1px); }
    .cpz-coin-edge-front { transform: translateZ(1px); }
    .cpz-coin-streaks { position: absolute; inset: 0; width: 216px; height: 72px; animation: cpz-pulse 1s ease-in-out infinite; }
    .cpz-hourglass-body { transform-origin: 108px 36px; animation: cpz-original-turn 2.4s var(--cp-ease) infinite; }
    @keyframes cpz-original-spin { to { transform: rotateY(360deg); } }
    @keyframes cpz-original-turn { to { transform: rotate(360deg); } }
    .cpz-state-confirming .cpz-illustration { transition: transform 450ms var(--cp-ease), opacity 450ms var(--cp-ease); }
    .is-coin-exit .cpz-illustration { transform: translateX(160px); opacity: 0; }
    .cpz-success-pane { position: absolute; inset: 0; pointer-events: auto; background: var(--cp-success); color: #fff; padding: 24px; display: flex; flex-direction: column; align-items: center; overflow-y: auto; animation: cpz-fade-in 250ms var(--cp-ease); }
    .cpz-success-pane.is-closing { opacity: 0; transition: opacity 220ms var(--cp-ease); }
    .cpz-success-pane .cpz-sheet-title { font-size: 20px; font-weight: 700; color: #fff; }
    .cpz-success-pane .cpz-sheet-live { font-size: 13px; font-weight: 500; color: rgba(255,255,255,.8); }
    .cpz-success-pane .cpz-success-badge { width: 216px; height: 80px; margin: 8px 0; transform: none; opacity: 1; background: none; color: #fff; box-shadow: none; border: 0; }
    .cpz-success-pane .cpz-success-badge svg { width: 216px; height: 72px; stroke: currentColor; stroke-width: 1.5; }
    .cpz-original-circle { transform-origin: 108px 36px; animation: cpz-success-scale 360ms var(--cp-ease); }
    .cpz-original-tick { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cpz-success-draw 320ms 360ms forwards; }
    .cpz-original-halo { transform-origin: 108px 36px; animation: cpz-success-halo 700ms ease-out; }
    @keyframes cpz-success-scale { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes cpz-success-draw { to { stroke-dashoffset: 0; } }
    @keyframes cpz-success-halo { from { transform: scale(.8); opacity: 0; } to { transform: scale(1.1); opacity: .2; } }
    .cpz-success-pane .cpz-receipt { width: 100%; max-width: 343px; border-radius: 12px; background: #fff; color: var(--cp-ink); padding: 16px; box-shadow: 0 8px 24px rgba(0,10,26,.12); }
    .cpz-success-pane .cpz-receipt-row { font-size: 14px; gap: 8px; align-items: start; }
    .cpz-success-pane .cpz-receipt-row strong { overflow-wrap: anywhere; min-width: 0; }
    .cpz-success-pane .cpz-receipt-row > span { flex-shrink: 0; font-size: 16px; font-weight: 700; }
    .cpz-success-pane .cpz-receipt-meta { font-size: 12px; color: var(--cp-muted); }
    .cpz-success-pane .cpz-receipt-pay { font-size: 13px; min-width: 0; gap: 8px; }
    .cpz-success-pane .cpz-receipt-pay > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cpz-success-pane .cpz-receipt-foot { border-top: 1px solid var(--cp-border); padding-top: 12px; font-size: 12px; color: var(--cp-muted); }
    .cpz-success-pane .cpz-support-links a, .cpz-success-pane .cpz-receipt-download { color: var(--cp-primary); font-size: 13px; }
    .cpz-success-pane .cpz-sheet-secured { color: rgba(255,255,255,.8); margin-top: auto; padding-top: 16px; font-size: 12px; }
    .cpz-paid .cpz-rzp-sidebar { opacity: .65; }
    .cpz-rzp-mobile-bar, .cpz-rzp-mobile-details { display: none; }
    .cpz-overlay :is(button, a, input, select, textarea):focus-visible { outline: 2px solid var(--cp-primary); outline-offset: 2px; }
    .cpz-overlay :is(button, a):hover { filter: brightness(.96); }
    .cpz-overlay :is(button, a):active { transform: scale(.98); }
    .cpz-overlay button:disabled { opacity: .45; cursor: not-allowed; transform: none; }
    .cpz-overlay [aria-busy="true"] { cursor: progress; }
    .cpz-overlay button[aria-busy="true"] { pointer-events: none; opacity: .65; }
    @media(max-width:767px) {
      .cpz-overlay .cpz-modal { height: 100vh; height: 100dvh; max-height: 100dvh; width: 100%; border-radius: 0; padding: 0; }
      .cpz-stage, .cpz-checkout-mount, .cpz-rzp-shell { height: 100%; min-height: 0; }
      .cpz-rzp-workspace { flex: 1; min-height: 0; border-radius: 8px 8px 0 0; background: #fff; overflow: hidden; }
      .cpz-rzp-body { flex: 1; min-height: 0; overflow-y: auto; }
      .cpz-rzp-mob-header { width: 100%; border: 0; font: inherit; text-align: left; padding: 12px 52px 12px 16px; cursor: pointer; }
      .cpz-rzp-mob-header .cpz-rzp-brand { min-width: 0; flex: 1; }
      .cpz-rzp-mob-header .cpz-rzp-name { font-size: 16px; }
      .cpz-rzp-mob-amount { font-size: 16px; }
      .cpz-rzp-mobile-details:not([hidden]) { display: block; flex-shrink: 0; max-height: 30dvh; overflow-y: auto; overflow-wrap: anywhere; padding: 0 16px 16px; background: var(--cp-primary); color: var(--cp-on-primary); font-size: 13px; }
      .cpz-rzp-intent-grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 8px; }
      .cpz-rzp-intent-btn { height: 56px; border-radius: 8px; min-width: 0; background: #fff; color: var(--cp-ink); border: 1px solid var(--cp-border); }
      .cpz-rzp-intent-btn[aria-pressed="true"] { border-color: var(--cp-primary); box-shadow: inset 0 0 0 1px var(--cp-primary); }
      .cpz-rzp-mobile-bar { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); background: #fff; border-top: 1px solid var(--cp-border); }
      .cpz-rzp-mobile-bar strong { font-size: 16px; font-variant-numeric: tabular-nums; }
      .cpz-rzp-mob-continue { height: 44px; padding: 0 24px; border: 0; font: inherit; font-weight: 600; }
      .cpz-upi-tile-wrap, .cpz-upi-tile, .cpz-upi-tile img.cpz-upi-qr-img { width: 224px; height: 224px; }
      .cpz-upi-info { min-width: 0; max-width: 100%; text-align: center; }
      .cpz-upi-info > * { max-width: 100%; overflow-wrap: anywhere; }
      .cpz-upi-download { border-radius: 8px; }
      .cpz-how { flex-direction: column; align-items: flex-start; }
      .cpz-interruption { width: 100%; max-height: 100%; padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
      .cpz-success-pane { padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
      .cpz-paid .cpz-rzp-mobile-bar { display: none; }
    }
    @media(prefers-reduced-motion:reduce) {
      .cpz-native-animation { display: none; }
      .cpz-coin-streaks { display: none; }
      .cpz-overlay :is(button, a):active { transform: none; }
      .cpz-original-tick { stroke-dashoffset: 0; }
      .cpz-overlay *, .cpz-overlay *::before, .cpz-overlay *::after { animation: none !important; transition: opacity 125ms linear !important; }
      .cpz-upi-scanline { display: none !important; }
    }
  `;

  // SVG Icons
  var ICONS = {
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    smartphone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    loader:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',
  };

  // UPI App logos - using Play Store icons for reliability
  var UPI_APPS = [
    {
      name: "GPay",
      logo: "https://play-lh.googleusercontent.com/Fm5PDRimTL_KsWyIRcTv9h0JLrTkDOMwh18SE819OXjEZhlwMYBHJXxUZ8eOBudxCsHC=w240-h480-rw",
    },
    {
      name: "PhonePe",
      logo: "https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXJ93q6DZkmx07Er1o90PXYeo6mzL4VC2Gj9s=w240-h480-rw",
    },
    {
      name: "Paytm",
      logo: "https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=w240-h480-rw",
    },
    {
      name: "BHIM",
      logo: "https://play-lh.googleusercontent.com/B5cNBA15IxjCT-8UTXEWgiPcGkJ1C07iHKwm2Hbs8xR3PnJvZ0swTag3abdC_Fj5OfnP=w240-h480-rw",
    },
  ];

  /**
   * CrazzyPe Checkout Constructor — safe to call with or without `new`
   * (matches Razorpay / legacy merchant snippets).
   */
  function CrazzyPe(options) {
    if (!(this instanceof CrazzyPe)) {
      return new CrazzyPe(options);
    }

    if (!options) {
      throw new Error("CrazzyPe: Options are required");
    }

    var key = options.key || options.api_key || options.apiKey || "";
    if (!key) {
      throw new Error("CrazzyPe: API key is required");
    }

    if (options.amount === undefined || options.amount === null || options.amount === "") {
      throw new Error("CrazzyPe: Amount is required");
    }

    var themeOpt = options.theme || {};
    var theme = Object.assign({}, THEME, themeOpt);
    if (themeOpt.color && !themeOpt.primary) {
      theme.primary = themeOpt.color;
      theme.accent = themeOpt.color;
      theme.gradient = themeOpt.color;
    }

    var modal = options.modal || {};
    this.options = {
      key: key,
      amount: options.amount,
      currency: options.currency || "INR",
      name: options.name || options.merchant_name || "CrazzyPe",
      description: options.description || options.p_info || "Payment",
      image: options.image || options.logo || "",
      order_id: options.order_id || options.orderId || options.txn_id || "",
      callback_url: options.callback_url || options.callbackUrl || options.redirect_url || "",
      prefill: Object.assign(
        {},
        {
          name: options.customer_name || "",
          email: options.customer_email || "",
          contact: options.customer_mobile || options.customer_phone || "",
        },
        options.prefill || {},
      ),
      notes: options.notes || options.udf || {},
      theme: theme,
      modal: modal,
      handler: options.handler || options.onsuccess || null,
      onSuccess: options.onSuccess || null,
      onFailure: options.onFailure || options.onfailed || null,
      onDismiss: options.onDismiss || modal.ondismiss || null,
      support: (function () {
        var raw = options.support || (options.config && options.config.support) || {};
        if (typeof raw !== "object" || raw === null) raw = {};
        return {
          email:
            raw.email ||
            options.support_email ||
            options.supportEmail ||
            "",
          phone:
            raw.phone ||
            raw.contact ||
            options.support_phone ||
            options.supportPhone ||
            "",
          url:
            raw.url ||
            raw.link ||
            options.support_url ||
            options.supportUrl ||
            "",
        };
      })(),
    };

    this._merchantOrderId = this.options.order_id;
    this._session = 0;
    this.overlay = null;
    this.orderDetails = null;
    this.pollingInterval = null;
    this.paymentTimer = null;
    this.utrPromptTimeout = null;
    this.utrPromptShown = false;
    this.utrLayer = null;
    this._qrActivated = false;
    this.timeLeft = 30;
    this.qrTimeoutSeconds = 30;
    this.timerCircumference = 2 * Math.PI * 18;
  }

  /**
   * Open the payment checkout
   */
  CrazzyPe.prototype.open = function () {
    var self = this;

    var session = ++this._session;
    this._successAccepted = false;
    this._successFinished = false;
    this._successShown = false;
    this._confirmingReady = false;
    this._lastCheckedAt = null;
    this._lastCheckedLabel = null;
    this._closeMenu = null;
    if (this._closeLightbox) this._closeLightbox();
    if (this._sheetScrim) this._sheetScrim.remove();
    this._sheetScrim = null;
    this._clearSheet();
    this._expiredAt = null;
    this._qrExpiresAt = null;
    // Reset per-open state so reusing an instance (legacy pattern) still works
    this._qrActivated = false;
    this.utrPromptShown = false;
    this._pendingSheetShown = false;
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.utrPromptTimeout) {
      clearTimeout(this.utrPromptTimeout);
      this.utrPromptTimeout = null;
    }

    this._injectStyles();
    try {
      this._previousActiveElement = document.activeElement;
    } catch (e) {
      this._previousActiveElement = null;
    }
    this._ensureShell();
    this._showFrameLoader();
    this._bindA11y();

    this._validateOrigin()
      .then(function () {
        return self._checkIncognitoFeature();
      })
      .then(function (hasFeature) {
        if (self._session !== session || !self.overlay) return null;
        if (!hasFeature) {
          self._showError(
            "Incognito checkout is a premium feature. Please upgrade your plan or verify your API key.",
          );
          return Promise.reject(new Error("Feature not available"));
        }
        if (self._session !== session || !self.overlay) return null;
        return self._createOrder();
      })
      .then(function (data) {
        if (self._session !== session || !self.overlay) return;
        if (data && data.status === "success") {
          self.orderDetails = data;
          self.qrTimeoutSeconds =
            Number(data.qr_timeout_seconds) ||
            (String(data.merchantId || "").toLowerCase() === "bharatpe"
              ? 20
              : String(data.merchantId || "").toLowerCase() === "quintuspay"
                ? 30
                : 300);
          self._showCheckoutFrame(data);
        } else if (data) {
          self._showError(data.message || "Failed to initialize payment");
        }
      })
      .catch(function (error) {
        if (self._session !== session || !self.overlay) return;
        if (error && error.message !== "Feature not available") {
          self._showError((error && error.message) || "Failed to initialize payment");
        }
      });
  };

  /**
   * Inject CSS styles into the page (replace so UI updates survive hot reload)
   */
  CrazzyPe.prototype._injectStyles = function () {
    var existing = document.getElementById("cpz-styles");
    if (existing) {
      existing.textContent = STYLES;
      return;
    }
    var style = document.createElement("style");
    style.id = "cpz-styles";
    style.textContent = STYLES;
    document.head.appendChild(style);
  };

  /**
   * Build the fixed-size shell once; all frames transition inside it.
   */
  CrazzyPe.prototype._ensureShell = function () {
    var self = this;
    if (this.overlay && this.stageEl) {
      this._applyThemeVars(this.overlay);
      return;
    }

    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = document.createElement("div");
    this.overlay.className = "cpz-overlay";
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.setAttribute("aria-label", "CrazzyPe Checkout");
    this.overlay.onclick = function (e) {
      if (
        e.target === self.overlay &&
        self.options.modal.backdropclose !== false
      ) {
        self._requestClose();
      }
    };

    this.modalEl = document.createElement("div");
    this.modalEl.className = "cpz-modal";

    var closeBtn = document.createElement("button");
    closeBtn.className = "cpz-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close payment");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = function () {
      self._requestClose();
    };
    this.modalEl.appendChild(closeBtn);

    var content = document.createElement("div");
    content.className = "cpz-content";

    this.stageEl = document.createElement("div");
    this.stageEl.className = "cpz-stage";

    this.loaderEl = this._createFrameLoader();
    this.checkoutMount = document.createElement("div");
    this.checkoutMount.className = "cpz-checkout-mount";

    this.ariaLive = document.createElement("div");
    this.ariaLive.className = "cpz-aria-live";
    this.ariaLive.setAttribute("aria-live", "polite");

    this.stageEl.appendChild(this.loaderEl);
    this.stageEl.appendChild(this.checkoutMount);
    this.stageEl.appendChild(this.ariaLive);
    content.appendChild(this.stageEl);
    this.modalEl.appendChild(content);
    this.overlay.appendChild(this.modalEl);
    this._applyThemeVars(this.overlay);
    document.body.appendChild(this.overlay);
    document.body.style.overflow = "hidden";

    this._shellReady = true;
    if (!this._onOffline) {
      this._onOffline = function () { self._showOfflineSheet(); };
      this._onOnline = function () {
        if (self._state === "offline") self._clearSheet();
        if (self._pollNow) self._pollNow(true);
      };
      window.addEventListener("offline", this._onOffline);
      window.addEventListener("online", this._onOnline);
    }
    this._setState("loader");
    this._announce("Loading checkout");
    this._focusFirstInOverlay();
  };

  /** Shared interruption renderer; data is private presentation, never SDK options. */
  CrazzyPe.prototype._renderSheet = function (data) {
    this._ensureShell();
    if (!this.sheetHost) {
      this.loaderEl.classList.add("is-hidden");
      this.checkoutMount.classList.add("is-visible");
      this.sheetHost = document.createElement("div");
      this.sheetHost.className = "cpz-sheet-host";
      this.stageEl.appendChild(this.sheetHost);
    }
    var sheet = document.createElement("section");
    sheet.className = "cpz-sheet cpz-interruption cpz-state-" + data.state;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    var art = document.createElement("div");
    art.className = "cpz-illustration";
    art.style.setProperty("--cp-accent", data.accent || "var(--cp-primary)");
    art.innerHTML = data.art || WARNING_SVG;
    var title = document.createElement("h2");
    title.className = "cpz-sheet-title";
    title.id = "cpz-sheet-title";
    title.tabIndex = -1;
    title.textContent = data.title;
    sheet.setAttribute("aria-labelledby", title.id);
    var body = document.createElement("p");
    body.className = "cpz-sheet-sub";
    body.textContent = data.body || "";
    sheet.appendChild(art); sheet.appendChild(title); sheet.appendChild(body);
    if (data.details) data.details(sheet);
    var actions = document.createElement("div");
    actions.className = "cpz-sheet-actions";
    [data.outline, data.primary].forEach(function (action, index) {
      if (!action) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "cpz-sheet-btn" + (index === 0 ? " secondary" : "");
      button.textContent = action.label;
      button.onclick = action.run;
      actions.appendChild(button);
    });
    sheet.appendChild(actions);
    if (data.secured) {
      var secured = document.createElement("div");
      secured.className = "cpz-sheet-secured";
      secured.textContent = "Secured by CrazzyPe";
      sheet.appendChild(secured);
    }
    this._sheetEscape = data.outline ? data.outline.run : null;
    this._openSheet(sheet);
    this._setState(data.state);
    this._loadStateAnimation(art, data.state);
    title.focus();
    this._announce(data.title + ". " + (data.body || ""));
    return sheet;
  };

  CrazzyPe.prototype._loadStateAnimation = function (host, state) {
    if (!host || !window.fetch || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var paths = {
      confirming: "/checkout-assets/animations/confirming-coin-orbit-a.json",
      success: "/checkout-assets/animations/success-check-pop-b.json",
    };
    var path = paths[state];
    if (!path) return;
    var self = this, session = this._session, started = performance.now();
    fetch(path).then(function (response) {
      if (!response.ok) throw new Error("animation unavailable");
      return response.json();
    }).then(function (data) {
      var wait = Math.max(0, 300 - (performance.now() - started));
      setTimeout(function () {
        if (self._session !== session || self._state !== state || !host.parentNode) return;
        var svg = self._renderNativeAnimation(data, state === "confirming");
        if (!svg) return;
        host.innerHTML = "";
        host.appendChild(svg);
      }, wait);
    }).catch(function () { /* CSS/SVG fallback remains visible. */ });
  };

  CrazzyPe.prototype._renderNativeAnimation = function (data, loop) {
    if (!data || !data.layers || !data.layers[0] || !document.createElementNS) return null;
    var ns = "http://www.w3.org/2000/svg", layer = data.layers[0], group = document.createElementNS(ns, "g");
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "cpz-native-animation");
    svg.setAttribute("viewBox", "0 0 " + data.w + " " + data.h);
    svg.setAttribute("aria-hidden", "true");
    group.setAttribute("transform", "translate(" + layer.ks.p.k[0] + " " + layer.ks.p.k[1] + ")");
    svg.appendChild(group);
    function color(value) {
      return "rgb(" + value.slice(0, 3).map(function (n) { return Math.round(n * 255); }).join(",") + ")";
    }
    (layer.shapes || []).forEach(function (shape) {
      if (shape.ty !== "gr") return;
      var items = shape.it || [], fill = "", stroke = "", width = 1;
      items.forEach(function (item) {
        if (item.ty === "fl") fill = color(item.c.k);
        if (item.ty === "st") { stroke = color(item.c.k); width = item.w.k; }
      });
      items.forEach(function (item) {
        var node;
        if (item.ty === "el") {
          node = document.createElementNS(ns, "ellipse");
          node.setAttribute("cx", item.p.k[0]); node.setAttribute("cy", item.p.k[1]);
          node.setAttribute("rx", item.s.k[0] / 2); node.setAttribute("ry", item.s.k[1] / 2);
        } else if (item.ty === "sh") {
          var points = item.ks.k.v;
          node = document.createElementNS(ns, "path");
          node.setAttribute("d", points.map(function (point, index) { return (index ? "L" : "M") + point[0] + " " + point[1]; }).join(" ") + (item.ks.k.c ? "Z" : ""));
        }
        if (!node) return;
        node.setAttribute("fill", item.ty === "el" ? (fill || "none") : "none");
        if (stroke) { node.setAttribute("stroke", stroke); node.setAttribute("stroke-width", width); node.setAttribute("stroke-linecap", "round"); node.setAttribute("stroke-linejoin", "round"); }
        group.appendChild(node);
      });
    });
    var scale = layer.ks.s.k, rotation = layer.ks.r.k;
    var scales = Array.isArray(scale) && scale[0] && scale[0].s ? scale.map(function (key) { return "scale(" + key.s[0] / 100 + ")"; }) : ["scale(" + scale[0] / 100 + ")"];
    var rotations = Array.isArray(rotation) && rotation[0] && rotation[0].s ? rotation.map(function (key) { return "rotate(" + key.s[0] + "deg)"; }) : ["rotate(0deg)"];
    if (group.animate) group.animate(scales.map(function (value, index) {
      return { transform: rotations[Math.min(index, rotations.length - 1)] + " " + value };
    }), { duration: (data.op - data.ip) / data.fr * 1000, iterations: loop ? Infinity : 1, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" });
    return svg;
  };

  CrazzyPe.prototype._showCloseDuringConfirming = function () {
    var self = this;
    this._renderSheet({ state: "close-during-confirming", art: CLOCK_SVG, accent: "var(--cp-warning)", title: "Your payment is in progress", body: "Closing this window won't cancel it. Please don't pay again.", outline: { label: "Close anyway", run: function () { self.close(); } }, primary: { label: "Stay", run: function () {
      self._showConfirmingSheet();
      if (self._confirmingReady) self._completeConfirming();
    } } });
  };

  CrazzyPe.prototype._showStartupError = function (data) {
    var self = this;
    data = data || {};
    this._renderSheet({ state: "startup-error", art: WARNING_SVG, accent: "var(--cp-warning)", title: "Couldn't start this payment", body: (data.message || "The payment could not be started").replace(/[.\s]+$/, "") + ". Please try again or contact " + this._merchantDisplayName() + ".", details: function (sheet) { self._appendMerchantSupportBlock(sheet); }, outline: { label: "Close", run: function () { self.close(); } }, primary: data.retryable ? { label: "Try again", run: function () { self._restartPayment(); } } : null });
  };

  CrazzyPe.prototype._setState = function (state) {
    this._state = state;
    if (this.modalEl) this.modalEl.setAttribute("data-cpz-state", state);
    if (this._mobileContinue) this._mobileContinue.disabled = !this._selectedMobileIntent || this._successAccepted || this._expiredAt != null || (state !== "live-qr" && state !== "near-expiry");
  };

  CrazzyPe.prototype._restartPayment = function () {
    if (this._successAccepted) return;
    if (this._merchantOrderId) { this.close(); return; }
    this._clearSheet();
    this.options.order_id = "";
    this.open();
    this._setState("refreshing");
  };

  CrazzyPe.prototype._showOfflineSheet = function () {
    var self = this;
    if (!this.sheetHost || this._successAccepted || this._state === "offline") return;
    this._resumeState = this._state;
    this._renderSheet({ state: "offline", art: OFFLINE_SVG, accent: "var(--cp-muted-60)", title: "You're offline", body: "Check your Wi-Fi or mobile data. We'll reconnect automatically.", outline: { label: "Retry", run: function () { if (self._pollNow) self._pollNow(true); } } });
  };

  CrazzyPe.prototype._announce = function (message) {
    if (!this.ariaLive) return;
    this.ariaLive.textContent = "";
    var self = this;
    var session = this._session;
    setTimeout(function () {
      if (self._session === session && self.ariaLive) self.ariaLive.textContent = message || "";
    }, 30);
  };

  CrazzyPe.prototype._getFocusable = function () {
    if (!this.overlay) return [];
    var focusRoot = this._activeSheet || this.overlay;
    var nodes = focusRoot.querySelectorAll(
      'button:not([disabled]):not([hidden]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.offsetParent === null && n !== document.activeElement) continue;
      if (n.getAttribute("aria-hidden") === "true") continue;
      if (n.classList && n.classList.contains("is-hidden")) continue;
      list.push(n);
    }
    return list;
  };

  CrazzyPe.prototype._focusFirstInOverlay = function () {
    var self = this;
    var session = this._session;
    setTimeout(function () {
      if (!self.overlay || self._session !== session) return;
      var list = self._getFocusable();
      if (list.length) list[0].focus();
      else if (self.modalEl) {
        self.modalEl.setAttribute("tabindex", "-1");
        self.modalEl.focus();
      }
    }, 40);
  };

  CrazzyPe.prototype._bindA11y = function () {
    var self = this;
    if (this._a11yBound) return;
    this._a11yBound = true;
    this._onKeyDown = function (e) {
      if (!self.overlay) return;
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        self._requestClose();
        return;
      }
      if (e.key !== "Tab" && e.keyCode !== 9) return;
      var list = self._getFocusable();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !(self._activeSheet || self.overlay).contains(document.activeElement) || list.indexOf(document.activeElement) < 0) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || list.indexOf(document.activeElement) < 0) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", this._onKeyDown, true);
  };

  CrazzyPe.prototype._unbindA11y = function () {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown, true);
      this._onKeyDown = null;
    }
    this._a11yBound = false;
  };

  CrazzyPe.prototype._createFrameLoader = function () {
    var el = document.createElement("div");
    el.className = "cpz-frame-loader";
    el.innerHTML =
      '<div class="cpz-loader-shield" aria-hidden="true">' +
      '<svg viewBox="0 0 64 64" fill="none">' +
      '<path d="M32 6L10 16v14c0 14.8 10.2 28.6 22 32 11.8-3.4 22-17.2 22-32V16L32 6z" fill="currentColor"/>' +
      '<path d="M24 32l5.5 5.5L42 25" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg></div>" +
      '<div class="cpz-loader-secured">' +
      ICONS.lock +
      "<span>Secured by CrazzyPe</span></div>";
    return el;
  };

  CrazzyPe.prototype._showFrameLoader = function () {
    this._ensureShell();
    this._setState("loader");
    this.modalEl.classList.remove("is-checkout-frame");
    if (this.loaderEl) {
      this.loaderEl.classList.remove("is-exit", "is-hidden");
    }
    if (this.checkoutMount) {
      this.checkoutMount.classList.remove("is-visible");
      this.checkoutMount.innerHTML = "";
    }
    this.checkoutRoot = null;
    this.sheetHost = null;
    this._clearSheetTimers();
  };

  CrazzyPe.prototype._showCheckoutFrame = function (data) {
    var self = this;
    this._ensureShell();
    this.modalEl.classList.add("is-checkout-frame");
    this.checkoutMount.innerHTML = "";
    this.checkoutRoot = this._createRazorpayCheckout(data);
    this.checkoutMount.appendChild(this.checkoutRoot);

    var workspace = this.checkoutRoot.querySelector(".cpz-rzp-workspace");
    this.sheetHost = document.createElement("div");
    this.sheetHost.className = "cpz-sheet-host";
    if (workspace) workspace.appendChild(this.sheetHost);
    if (this._sheetScrim) this._sheetScrim.remove();
    this._sheetScrim = document.createElement("div");
    this._sheetScrim.className = "cpz-sheet-scrim";
    this._sheetScrim.hidden = true;
    this.modalEl.appendChild(this._sheetScrim);

    // Crossfade Frame 1 → Frame 2 (same shell size)
    requestAnimationFrame(function () {
      self.checkoutMount.classList.add("is-visible");
      if (self.loaderEl) self.loaderEl.classList.add("is-exit");
      setTimeout(function () {
        if (self.loaderEl) self.loaderEl.classList.add("is-hidden");
      }, 220);
    });
    this._announce("Payment options ready");
  };

  CrazzyPe.prototype._clearSheetTimers = function () {
    if (this._sheetTimer) {
      clearTimeout(this._sheetTimer);
      this._sheetTimer = null;
    }
    if (this._redirectTimer) {
      clearInterval(this._redirectTimer);
      this._redirectTimer = null;
    }
  };

  CrazzyPe.prototype._setShellDimmed = function (dimmed) {
    if (!this.checkoutRoot) return;
    if (dimmed) this.checkoutRoot.classList.add("cpz-shell-dimmed");
    else this.checkoutRoot.classList.remove("cpz-shell-dimmed");
    if (this._sheetScrim) this._sheetScrim.hidden = !dimmed;
  };

  CrazzyPe.prototype._clearSheet = function () {
    this._clearSheetTimers();
    this._setShellDimmed(false);
    if (this.sheetHost) this.sheetHost.innerHTML = "";
    this._activeSheet = null;
    this._sheetEscape = null;
    this._setState(this._resumeState || (this._expiredAt != null ? "qr-expired" : this.timeLeft <= 60 ? "near-expiry" : "live-qr"));
    this._resumeState = null;
  };

  CrazzyPe.prototype._openSheet = function (sheet) {
    var self = this;
    if (!this.sheetHost) return null;
    var previous = this._activeSheet;
    this.sheetHost.innerHTML = "";
    this.sheetHost.appendChild(sheet);
    if (previous && previous.parentNode !== this.sheetHost && typeof sheet.animate === "function") {
      sheet.animate([{ opacity: .35 }, { opacity: 1 }], { duration: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 250, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
    this._activeSheet = sheet;
    this._setShellDimmed(true);
    requestAnimationFrame(function () {
      sheet.classList.add("is-open");
    });
    return sheet;
  };

  CrazzyPe.prototype._requestClose = function () {
    if (this._closeLightbox && this.modalEl && this.modalEl.querySelector(".cpz-qr-lightbox")) { this._closeLightbox(); return; }
    if (this._state === "overflow-menu" && this._closeMenu) { this._closeMenu(); return; }
    if (this._state === "confirming") { this._showCloseDuringConfirming(); return; }
    if (this._state === "success") { this._finishSuccess(this._successResponse, this.options.callback_url || "", this._successRedirect || ""); return; }
    if (this._activeSheet && this._sheetEscape) { this._sheetEscape(); return; }
    if (this._state === "close-during-confirming") return;
    if (this._qrActivated && this.checkoutRoot && !this._activeSheet) {
      this._showCancelConfirm();
      return;
    }
    this.close();
  };

  /**
   * Legacy entry used by older internal paths — maps onto the persistent shell.
   */
  CrazzyPe.prototype._renderModal = function (state, data) {
    this._ensureShell();
    if (state === "loading") {
      this._showFrameLoader();
      return;
    }
    if (state === "methods" || state === "payment") {
      this._showCheckoutFrame(data);
      return;
    }
    if (state === "processing") {
      this._beginProcessingFlow(data);
      return;
    }
    if (state === "success") {
      this._runSuccessSequence(data);
      return;
    }
    if (state === "error") {
      this._showFailureSheet(data);
    }
  };

  CrazzyPe.prototype._applyThemeVars = function (el) {
    if (!el) return;
    var primary =
      (this.options.theme && (this.options.theme.color || this.options.theme.primary)) ||
      THEME.primary;
    var rgb = this._parseHexColor(primary) || { r: 51, g: 149, b: 255 };
    var hover = this._mixWithBlack(rgb, 0.08);
    var active = this._mixWithBlack(rgb, 0.15);
    var soft =
      "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.1)";
    var contrast = this._contrastOnPrimary(rgb);
    var onPrimary = contrast.onPrimary;
    var isLight = contrast.luminance > 0.6;
    el.style.setProperty("--cp-primary", primary);
    el.style.setProperty("--cp-primary-hover", hover);
    el.style.setProperty("--cp-primary-active", active);
    el.style.setProperty("--cp-primary-soft", soft);
    el.style.setProperty("--cp-on-primary", onPrimary);
    if (isLight) el.classList.add("is-light-theme");
    else el.classList.remove("is-light-theme");
  };

  CrazzyPe.prototype._parseHexColor = function (hex) {
    if (!hex || typeof hex !== "string") return null;
    var h = hex.trim().replace("#", "");
    if (h.length === 3) {
      h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  };

  CrazzyPe.prototype._mixWithBlack = function (rgb, amount) {
    var r = Math.round(rgb.r * (1 - amount));
    var g = Math.round(rgb.g * (1 - amount));
    var b = Math.round(rgb.b * (1 - amount));
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    );
  };

  CrazzyPe.prototype._contrastOnPrimary = function (rgb) {
    var rs = rgb.r / 255;
    var gs = rgb.g / 255;
    var bs = rgb.b / 255;
    rs = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    gs = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    bs = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    var L = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    // WCAG-ish: prefer dark text on light themes (L > 0.6)
    return {
      luminance: L,
      onPrimary: L > 0.6 ? "#111827" : "#ffffff",
    };
  };

  CrazzyPe.prototype._resolveUpiPayload = function (data) {
    data = data || {};
    var candidates = [
      data.generic_upi_intent,
      data.upi_link,
      data.upi_intent,
      data.upiLink,
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (/^upi:\/\//i.test(candidates[i] || "")) return candidates[i];
    }
    if (data.upiId) {
      var amount = this._normalizeAmountRupees(this.options.amount);
      var tr = (data.order_id || this.options.order_id || "").toString();
      var query =
        "pay?pa=" +
        data.upiId +
        "&pn=" +
        (this.options.name || "") +
        "&am=" +
        amount +
        "&tr=" +
        tr +
        "&mc=9223&orgid=000000&mode=01&cu=INR&tn=" +
        (this.options.description || "");
      return "upi://" + encodeURI(query.replace(/\s/g, ""));
    }
    return "";
  };

  /** Match create-order api.qrserver artwork (high-res PNG, no logo/qzone stretch). */
  CrazzyPe.prototype._buildEccHQrUrl = function (payload, size) {
    size = size || 400;
    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=" +
      size +
      "x" +
      size +
      "&data=" +
      encodeURIComponent(payload)
    );
  };

  CrazzyPe.prototype._resolveCheckoutQrUrl = function (data) {
    data = data || {};
    // Prefer original per-order api.qrserver URL from create-order.
    if (data.qr_code_url) return data.qr_code_url;
    if (/^data:image\//i.test(data.qr_code || "")) return data.qr_code;
    if (data.payment_url) {
      try {
        var token = new URL(data.payment_url, window.location.href).pathname
          .split("/")
          .filter(Boolean)
          .pop();
        if (token) {
          return apiOrdersUrl(
            "/api/orders/checkout-qr/" + encodeURIComponent(token),
          );
        }
      } catch (e) {
        /* fall through */
      }
    }
    var payload = this._resolveUpiPayload(data);
    if (payload) return this._buildEccHQrUrl(payload, 400);
    return "";
  };

  CrazzyPe.prototype._createRazorpayCheckout = function (data) {
    var self = this;
    var session = this._session;
    var amountStr = this._formatAmount(this.options.amount);
    var customer = this._getCustomerDetails(data);
    var merchantName = this.options.name || "CrazzyPe";

    var root = document.createElement("div");
    root.className = "cpz-rzp-shell";

    // ---- Desktop left panel ----
    var sidebar = document.createElement("aside");
    sidebar.className = "cpz-rzp-sidebar";

    var sideStack = document.createElement("div");
    sideStack.className = "cpz-rzp-side-stack";

    var brand = document.createElement("div");
    brand.className = "cpz-rzp-brand";
    if (this.options.image) {
      var logo = document.createElement("img");
      logo.className = "cpz-logo";
      logo.src = this.options.image;
      logo.alt = merchantName;
      brand.appendChild(logo);
    } else {
      var ph = document.createElement("div");
      ph.className = "cpz-logo-placeholder";
      ph.textContent = merchantName.charAt(0).toUpperCase();
      brand.appendChild(ph);
    }
    var brandInfo = document.createElement("div");
    brandInfo.style.minWidth = "0";
    var nameEl = document.createElement("div");
    nameEl.className = "cpz-rzp-name";
    nameEl.textContent = merchantName;
    nameEl.title = merchantName;
    var trustEl = document.createElement("div");
    trustEl.className = "cpz-rzp-trust";
    trustEl.innerHTML = SHIELD_SVG + "<span>CrazzyPe Trusted Business</span>";
    brandInfo.appendChild(nameEl);
    brandInfo.appendChild(trustEl);
    brand.appendChild(brandInfo);

    var priceCard = document.createElement("div");
    priceCard.className = "cpz-rzp-price-card";
    var priceLabel = document.createElement("span");
    priceLabel.textContent = "Price Summary";
    var priceValue = document.createElement("strong");
    priceValue.textContent = amountStr;
    priceCard.appendChild(priceLabel);
    priceCard.appendChild(priceValue);
    if (this.options.description) {
      var descEl = document.createElement("div");
      descEl.className = "cpz-rzp-price-desc";
      descEl.textContent = this.options.description;
      descEl.title = this.options.description;
      priceCard.appendChild(descEl);
    }

    var orderRef =
      (this.options.order_id || this.options.orderId || this.options.receipt || "")
        .toString()
        .trim();
    if (orderRef) {
      var detailsPanel = document.createElement("div");
      detailsPanel.className = "cpz-rzp-order-details";
      if (this.options.receipt) {
        var receiptLine = document.createElement("div");
        receiptLine.textContent = "Receipt: " + this.options.receipt;
        receiptLine.title = String(this.options.receipt);
        detailsPanel.appendChild(receiptLine);
      }
      if (this.options.order_id || this.options.orderId) {
        var oid = (this.options.order_id || this.options.orderId).toString();
        var oidLine = document.createElement("div");
        oidLine.textContent = "Order ID: " + oid;
        oidLine.title = oid;
        detailsPanel.appendChild(oidLine);
      }
      var viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "cpz-rzp-view-details";
      viewBtn.textContent = "View details";
      viewBtn.setAttribute("aria-expanded", "false");
      viewBtn.onclick = function () {
        var open = detailsPanel.classList.toggle("is-open");
        viewBtn.setAttribute("aria-expanded", open ? "true" : "false");
        viewBtn.textContent = open ? "Hide details" : "View details";
      };
      priceCard.appendChild(viewBtn);
      priceCard.appendChild(detailsPanel);
    }

    var hasPrefillExtra = !!(customer.name || customer.email || customer.phone);
    var userRow = document.createElement("button");
    userRow.type = "button";
    userRow.className = "cpz-rzp-user-row";
    userRow.setAttribute("aria-expanded", "false");
    userRow.appendChild(this._createCustomerRowContent(customer));
    var prefillPanel = document.createElement("div");
    prefillPanel.className = "cpz-rzp-prefill-panel";
    if (customer.name) {
      var n = document.createElement("div");
      n.textContent = customer.name;
      n.title = customer.name;
      prefillPanel.appendChild(n);
    }
    if (customer.email) {
      var e = document.createElement("div");
      e.textContent = customer.email;
      e.title = customer.email;
      prefillPanel.appendChild(e);
    }
    if (customer.phone) {
      var p = document.createElement("div");
      p.textContent = customer.phone;
      p.title = customer.phone;
      prefillPanel.appendChild(p);
    }
    if (hasPrefillExtra) {
      var chevron = document.createElement("span");
      chevron.className = "cpz-rzp-user-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>';
      userRow.appendChild(chevron);
      userRow.onclick = function () {
        var open = prefillPanel.classList.toggle("is-open");
        userRow.setAttribute("aria-expanded", open ? "true" : "false");
      };
    } else {
      userRow.disabled = true;
      userRow.style.cursor = "default";
    }

    sideStack.appendChild(brand);
    sideStack.appendChild(priceCard);
    if (hasPrefillExtra) sideStack.appendChild(userRow);
    if (hasPrefillExtra) sideStack.appendChild(prefillPanel);

    var sideBottom = document.createElement("div");
    sideBottom.className = "cpz-rzp-sidebar-bottom";
    var bags = document.createElement("div");
    bags.className = "cpz-rzp-bags";
    bags.innerHTML = BAGS_SVG;
    var secured = document.createElement("div");
    secured.className = "cpz-rzp-secured";
    secured.innerHTML = ICONS.lock + "<span>Secured by CrazzyPe</span>";
    sideBottom.appendChild(bags);
    sideBottom.appendChild(secured);
    // Hide illustration when the panel is too short (<120px free)
    setTimeout(function () {
      try {
        var free =
          sidebar.clientHeight -
          sideStack.offsetHeight -
          secured.offsetHeight -
          32;
        if (free < 120) bags.style.display = "none";
      } catch (err) {
        /* ignore */
      }
    }, 0);

    sidebar.appendChild(sideStack);
    sidebar.appendChild(sideBottom);

    // ---- Mobile compact top bar ----
    var mobHeader = document.createElement("button");
    mobHeader.type = "button";
    mobHeader.setAttribute("aria-expanded", "false");
    mobHeader.setAttribute("aria-controls", "cpz-mobile-details");
    mobHeader.className = "cpz-rzp-mob-header";
    var mobBrand = document.createElement("div");
    mobBrand.className = "cpz-rzp-brand";
    if (this.options.image) {
      var mLogo = document.createElement("img");
      mLogo.className = "cpz-logo";
      mLogo.src = this.options.image;
      mLogo.alt = merchantName;
      mobBrand.appendChild(mLogo);
    } else {
      var mPh = document.createElement("div");
      mPh.className = "cpz-logo-placeholder";
      mPh.textContent = merchantName.charAt(0).toUpperCase();
      mobBrand.appendChild(mPh);
    }
    var mobName = document.createElement("div");
    mobName.className = "cpz-rzp-name";
    mobName.textContent = merchantName;
    mobName.title = merchantName;
    mobBrand.appendChild(mobName);
    var mobAmount = document.createElement("div");
    mobAmount.className = "cpz-rzp-mob-amount";
    mobAmount.textContent = amountStr;
    mobHeader.appendChild(mobBrand);
    mobHeader.appendChild(mobAmount);
    var mobDetails = document.createElement("div");
    mobDetails.id = "cpz-mobile-details"; mobDetails.className = "cpz-rzp-mobile-details"; mobDetails.hidden = true;
    [merchantName, this.options.description, customer.name, customer.phone, customer.email].forEach(function (value) {
      if (!value) return;
      var line = document.createElement("div"); line.textContent = value; mobDetails.appendChild(line);
    });
    mobHeader.onclick = function () {
      mobDetails.hidden = !mobDetails.hidden;
      mobHeader.setAttribute("aria-expanded", String(!mobDetails.hidden));
    };

    // ---- Right workspace ----
    var workspace = document.createElement("div");
    workspace.className = "cpz-rzp-workspace";

    var topbar = document.createElement("div");
    topbar.className = "cpz-rzp-topbar";
    var topTitle = document.createElement("div");
    topTitle.className = "cpz-rzp-topbar-title";
    topTitle.textContent = "Payment Options";
    var topActions = document.createElement("div");
    topActions.className = "cpz-rzp-topbar-actions";
    var menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "cpz-rzp-icon-btn";
    menuBtn.setAttribute("aria-label", "More options");
    menuBtn.textContent = "\u22EF";
    var closeTop = document.createElement("button");
    closeTop.type = "button";
    closeTop.className = "cpz-rzp-icon-btn";
    closeTop.setAttribute("aria-label", "Close payment");
    closeTop.innerHTML = "&times;";
    closeTop.onclick = function () {
      self._requestClose();
    };
    topActions.appendChild(menuBtn);
    topActions.appendChild(closeTop);
    topbar.appendChild(topTitle);
    topbar.appendChild(topActions);

    var menu = document.createElement("div");
    menu.className = "cpz-rzp-menu";
    menu.setAttribute("role", "menu");
    var menuTitle = document.createElement("strong");
    menuTitle.textContent = "Help & info";
    menu.appendChild(menuTitle);
    function closeMenu() {
      menu.classList.remove("is-open");
      self._setState(self._expiredAt != null ? "qr-expired" : self.timeLeft <= 60 ? "near-expiry" : "live-qr");
      menuBtn.focus();
    }
    self._closeMenu = closeMenu;
    function menuRow(title, subtitle, action) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      var icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "\u24D8";
      var copy = document.createElement("span");
      var label = document.createElement("span");
      label.textContent = title;
      var subline = document.createElement("small");
      subline.textContent = subtitle;
      copy.appendChild(label);
      copy.appendChild(subline);
      var chevron = document.createElement("span");
      chevron.textContent = "\u203A";
      chevron.setAttribute("aria-hidden", "true");
      button.appendChild(icon); button.appendChild(copy); button.appendChild(chevron);
      button.onclick = function () { closeMenu(); action(); };
      return button;
    }
    var contacts = self._getSupportContacts();
    if (contacts.email || contacts.phone || contacts.url) {
      menu.appendChild(menuRow("Contact " + merchantName, contacts.email || contacts.phone || "Support", function () { self._openMerchantSupport(); }));
    }
    var policies = document.createElement("div");
    policies.className = "cpz-menu-policies";
    policies.appendChild(menuRow("Terms & Privacy", "CrazzyPe policies", function () {
      policies.classList.toggle("is-expanded");
      menu.classList.add("is-open");
      self._setState("overflow-menu");
    }));
    ["terms", "privacy"].forEach(function (path) {
      var link = document.createElement("a");
      link.href = "https://crazzype.com/" + path;
      link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = path === "terms" ? "Terms" : "Privacy";
      policies.appendChild(link);
    });
    menu.appendChild(policies);
    var cancelBtn = menuRow("Cancel payment", "Leave this checkout", function () { self._showCancelConfirm(); });
    var menuClose = document.createElement("button");
    menuClose.type = "button";
    menuClose.className = "cpz-menu-close";
    menuClose.setAttribute("aria-label", "Close help menu");
    menuClose.textContent = "\u00D7";
    menuClose.onclick = closeMenu;
    menu.appendChild(menuClose);
    menu.appendChild(cancelBtn);
    topbar.appendChild(menu);
    menuBtn.onclick = function (ev) {
      ev.stopPropagation();
      if (menu.classList.contains("is-open")) closeMenu();
      else { menu.classList.add("is-open"); self._setState("overflow-menu"); menuClose.focus(); }
    };

    var body = document.createElement("div");
    body.className = "cpz-rzp-body";

    var panel = document.createElement("main");
    panel.className = "cpz-rzp-panel";

    var panelHead = document.createElement("div");
    panelHead.className = "cpz-rzp-panel-head";
    var headCopy = document.createElement("div");
    headCopy.className = "cpz-rzp-panel-head-copy";
    var panelTitle = document.createElement("h2");
    panelTitle.textContent = "UPI QR";
    var panelSub = document.createElement("p");
    panelSub.className = "cpz-rzp-panel-sub";
    panelSub.textContent = "Use any UPI app on your phone";
    headCopy.appendChild(panelTitle);
    // The single UPI QR heading does not need a duplicate subtitle.

    var timerEl = document.createElement("div");
    timerEl.className = "cpz-rzp-timer";
    timerEl.id = "cpz-rzp-timer-label";
    timerEl.setAttribute("aria-live", "off");
    timerEl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<span id="cpz-rzp-timer-text">05:00</span>';
    panelHead.appendChild(headCopy);
    panelHead.appendChild(timerEl);

    var hero = document.createElement("div");
    hero.className = "cpz-upi-hero";

    var tileWrap = document.createElement("div");
    tileWrap.className = "cpz-upi-tile-wrap";

    var brackets = document.createElement("div");
    brackets.className = "cpz-upi-brackets";
    brackets.setAttribute("aria-hidden", "true");
    brackets.innerHTML =
      '<span class="tl"></span><span class="tr"></span><span class="bl"></span><span class="br"></span>';

    var tileBtn = document.createElement("button");
    tileBtn.type = "button";
    tileBtn.className = "cpz-upi-tile";
    tileBtn.title = "Click to enlarge";
    tileBtn.setAttribute("aria-label", "Payment QR code. Click to enlarge");

    var shimmer = document.createElement("div");
    shimmer.className = "cpz-upi-shimmer";
    shimmer.setAttribute("aria-hidden", "true");
    tileBtn.appendChild(shimmer);

    var scanline = document.createElement("div");
    scanline.className = "cpz-upi-scanline";
    scanline.setAttribute("aria-hidden", "true");
    scanline.hidden = true;

    var expired = document.createElement("div");
    expired.className = "cpz-upi-expired";
    expired.innerHTML =
      '<svg class="cpz-upi-expired-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<div class="cpz-upi-expired-label">QR expired</div>';
    var refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "cpz-upi-refresh";
    refreshBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
      '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' +
      "<span>Refresh QR</span>";
    expired.appendChild(refreshBtn);

    // No scanner corner brackets; the QR quiet zone is the visual boundary.
    tileWrap.appendChild(tileBtn);
    tileWrap.appendChild(scanline);
    tileWrap.appendChild(expired);

    var info = document.createElement("div");
    info.className = "cpz-upi-info";
    var amtLabel = document.createElement("div");
    amtLabel.className = "cpz-upi-amt-label";
    amtLabel.textContent = "Amount to pay";
    var amtValue = document.createElement("div");
    amtValue.className = "cpz-upi-amt-value";
    amtValue.textContent = amountStr;
    var merchEl = document.createElement("div");
    merchEl.className = "cpz-upi-merchant";
    merchEl.textContent = merchantName;
    merchEl.title = merchantName;
    var divider = document.createElement("hr");
    divider.className = "cpz-upi-divider";
    var scanLabel = document.createElement("div");
    scanLabel.className = "cpz-upi-scan-label";
    scanLabel.textContent = "Scan the QR using any UPI app";

    var apps = document.createElement("div");
    apps.className = "cpz-upi-apps";
    UPI_APPS.forEach(function (app) {
      var tile = document.createElement("span");
      tile.className = "cpz-upi-app-tile";
      tile.title = app.name;
      var img = document.createElement("img");
      img.src = app.logo;
      img.alt = app.name;
      tile.appendChild(img);
      apps.appendChild(tile);
    });
    var more = document.createElement("span");
    more.className = "cpz-upi-more";
    more.textContent = "+ more";
    more.title = "Any UPI app";
    apps.appendChild(more);

    var status = document.createElement("div");
    status.className = "cpz-upi-status";
    status.innerHTML =
      '<span class="cpz-upi-status-dot" aria-hidden="true"></span>' +
      '<span class="cpz-upi-status-text">Generating QR\u2026</span>';
    var statusText = status.querySelector(".cpz-upi-status-text");

    var downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "cpz-upi-download";
    downloadBtn.hidden = true;
    downloadBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      "<span>Download QR</span>";

    info.appendChild(amtLabel);
    info.appendChild(amtValue);
    info.appendChild(merchEl);
    info.appendChild(divider);
    info.appendChild(scanLabel);
    info.appendChild(apps);
    info.appendChild(status);
    info.appendChild(downloadBtn);

    hero.appendChild(tileWrap);
    hero.appendChild(info);

    var how = document.createElement("div");
    how.className = "cpz-how";
    how.innerHTML =
      '<span class="cpz-how-step"><span class="cpz-how-num">1</span>Open any UPI app</span>' +
      '<span class="cpz-how-chev" aria-hidden="true">\u203A</span>' +
      '<span class="cpz-how-step"><span class="cpz-how-num">2</span>Scan this QR</span>' +
      '<span class="cpz-how-chev" aria-hidden="true">\u203A</span>' +
      '<span class="cpz-how-step"><span class="cpz-how-num">3</span>Approve with your UPI PIN</span>';

    var mobileBar = document.createElement("div");
    mobileBar.className = "cpz-rzp-mobile-bar";
    var mobileAmount = document.createElement("strong"); mobileAmount.textContent = amountStr;
    var mobileContinue = document.createElement("button");
    mobileContinue.type = "button"; mobileContinue.className = "cpz-rzp-mob-continue";
    mobileContinue.textContent = "Continue"; mobileContinue.disabled = true;
    mobileContinue.onclick = function () { if (self._session === session) self._continueMobilePayment(); };
    mobileBar.appendChild(mobileAmount); mobileBar.appendChild(mobileContinue);
    this._mobileContinue = mobileContinue;
    this._selectedMobileIntent = "";
    var intentGrid = document.createElement("div");
    intentGrid.className = "cpz-rzp-intent-grid";
    intentGrid.setAttribute("role", "group");
    intentGrid.setAttribute("aria-label", "Choose a UPI app");
    function addIntent(label, logo, uriPicker) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cpz-rzp-intent-btn";
      if (logo) {
        var ic = document.createElement("img");
        ic.src = logo;
        ic.alt = "";
        btn.appendChild(ic);
      }
      var t = document.createElement("span");
      t.textContent = label;
      btn.appendChild(t);
      btn.setAttribute("aria-pressed", "false");
      btn.disabled = !uriPicker();
      btn.onclick = function () { if (self._session === session) self._selectMobileApp(btn, intentGrid, uriPicker()); };
      intentGrid.appendChild(btn);
    }
    addIntent("GPay", UPI_APPS[0].logo, function () {
      return (
        (data.upi_app_intents && data.upi_app_intents.gpay) ||
        self._pickFirstNonPaytmUri([data.generic_upi_intent, data.upi_link, data.upi_intent])
      );
    });
    addIntent("PhonePe", UPI_APPS[1].logo, function () {
      return (
        (data.upi_app_intents && data.upi_app_intents.phonepe) ||
        self._pickFirstNonPaytmUri([data.generic_upi_intent, data.upi_link, data.upi_intent])
      );
    });
    addIntent("Paytm", UPI_APPS[2].logo, function () {
      return (
        (data.upi_app_intents && data.upi_app_intents.paytm) ||
        self._pickFirstNonPaytmUri([data.upi_link, data.upi_intent, data.generic_upi_intent])
      );
    });
    addIntent("Other UPI app", null, function () {
      return self._pickFirstNonPaytmUri([
        data.generic_upi_intent,
        data.upi_link,
        data.upi_intent,
      ]);
    });

    var showQrLink = document.createElement("button");
    showQrLink.type = "button";
    showQrLink.className = "cpz-rzp-show-qr";
    showQrLink.textContent = "Show QR";
    showQrLink.setAttribute("aria-expanded", "false");
    showQrLink.setAttribute("aria-controls", "cpz-mobile-qr");
    hero.id = "cpz-mobile-qr";
    showQrLink.onclick = function () {
      var visible = hero.classList.toggle("is-mobile-visible");
      showQrLink.textContent = visible ? "Hide QR" : "Show QR";
      showQrLink.setAttribute("aria-expanded", String(visible));
    };

    panel.appendChild(panelHead);
    panel.appendChild(intentGrid);
    panel.appendChild(showQrLink);
    panel.appendChild(hero);
    panel.appendChild(how);
    body.appendChild(panel);
    workspace.appendChild(topbar);
    workspace.appendChild(body);
    workspace.appendChild(mobileBar);

    var qrImgEl = null;
    var currentQrSrc = "";

    function setStatus(text, mode) {
      statusText.textContent = text;
      status.classList.remove("is-warn", "is-expired");
      if (mode) status.classList.add(mode);
    }

    function clearTileMedia() {
      if (qrImgEl && qrImgEl.parentNode) qrImgEl.parentNode.removeChild(qrImgEl);
      qrImgEl = null;
      scanline.hidden = true;
      if (!shimmer.parentNode) tileBtn.insertBefore(shimmer, tileBtn.firstChild);
      shimmer.hidden = false;
    }

    function showLiveQr(src) {
      clearTileMedia();
      shimmer.hidden = true;
      var img = document.createElement("img");
      img.className = "cpz-upi-qr-img is-enter";
      img.alt = "Payment QR Code";
      img.decoding = "async";
      img.onload = function () {
        if (qrImgEl !== img || !self._qrActivated || !self.overlay || self._session !== session || self._successAccepted) return;
        self._startTimer();
        if (self.timeLeft === 0) return;
        if (!self._activeSheet && self._state !== "overflow-menu") self._setState(self.timeLeft <= 60 ? "near-expiry" : "live-qr");
        requestAnimationFrame(function () {
          img.classList.add("is-in");
          img.classList.remove("is-enter");
        });
        scanline.hidden = false;
        setStatus(self.timeLeft <= 60 ? "QR expires soon" : "Waiting for payment\u2026", self.timeLeft <= 60 ? "is-warn" : null);
        downloadBtn.hidden = false;
      };
      img.onerror = function () {
        if (self._session !== session || !self.overlay || self._successAccepted) return;
        setStatus("Unable to load QR", "is-expired");
        self._showError("Unable to load the payment QR. Please close and try again.");
      };
      img.src = src;
      currentQrSrc = src;
      tileBtn.appendChild(img);
      qrImgEl = img;

    }

    function loadQr(isRefresh) {
      if (!self.overlay || self._session !== session || self._successAccepted) return;
      tileWrap.classList.remove("is-expired");
      timerEl.classList.remove("is-expired", "is-warn", "is-danger");
      downloadBtn.hidden = true;
      setStatus(isRefresh ? "Generating QR\u2026" : "Generating QR\u2026", null);
      clearTileMedia();

      self._qrActivated = true;
      self._onVisibilityResync = null;

      if (self.paymentTimer) {
        clearInterval(self.paymentTimer);
        self.paymentTimer = null;
      }
      if (self.pollingInterval) {
        clearInterval(self.pollingInterval);
        self.pollingInterval = null;
      }

      var src = self._resolveCheckoutQrUrl(data);

      if (!src) {
        setStatus("QR unavailable", "is-expired");
        return;
      }

      showLiveQr(src);

      if (self._isBharatPeOrder(data)) {
        self._scheduleBharatPeUtrReminder();
      } else {
        self._startPolling();
      }
    }

    function markExpired() {
      tileWrap.classList.add("is-expired");
      hero.classList.add("is-expired");
      timerEl.classList.add("is-expired");
      timerEl.classList.remove("is-warn", "is-danger");
      var tt = document.getElementById("cpz-rzp-timer-text");
      if (tt) tt.textContent = "00:00";
      setStatus(self._merchantOrderId ? "QR expired. Please close and try again." : "QR expired", "is-expired");
      refreshBtn.textContent = self._merchantOrderId ? "Close" : "Start again";
      downloadBtn.hidden = true;
      scanline.hidden = true;
    }

    self._onQrExpired = markExpired;
    self._setQrNearExpiry = function () {
      if (!self._activeSheet && self._state !== "overflow-menu") self._setState("near-expiry");
      setStatus("QR expires soon", "is-warn");
    };

    refreshBtn.onclick = function () {
      refreshBtn.classList.add("is-loading");
      self._restartPayment();
    };

    tileBtn.onclick = function () {
      if (tileWrap.classList.contains("is-expired") || !currentQrSrc) return;
      self._openQrLightbox(currentQrSrc);
    };

    downloadBtn.onclick = function () {
      if (!currentQrSrc) return;
      self._downloadQrPng(currentQrSrc, amountStr, merchantName);
    };

    if (!self._visibilityBound) {
      self._visibilityBound = true;
      self._onVisibilityChange = function () {
        if (document.visibilityState === "visible" && typeof self._onVisibilityResync === "function") self._onVisibilityResync();
      };
      document.addEventListener("visibilitychange", self._onVisibilityChange);
    }

    root.appendChild(sidebar);
    root.appendChild(mobHeader);
    root.appendChild(mobDetails);
    root.appendChild(workspace);

    requestAnimationFrame(function () {
      hero.classList.add("is-in");
    });

    setTimeout(function () {
      loadQr(false);
    }, 0);

    return root;
  };

  CrazzyPe.prototype._openQrLightbox = function (src) {
    var self = this;
    if (!this.modalEl || !src) return;
    var existing = this.modalEl.querySelector(".cpz-qr-lightbox");
    if (existing) existing.parentNode.removeChild(existing);

    var lb = document.createElement("div");
    lb.className = "cpz-qr-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-label", "Enlarged payment QR");
    var card = document.createElement("div");
    card.className = "cpz-qr-lightbox-card";
    var img = document.createElement("img");
    img.src = src;
    img.alt = "Payment QR Code";
    card.appendChild(img);
    lb.appendChild(card);
    this.modalEl.appendChild(lb);
    requestAnimationFrame(function () {
      lb.classList.add("is-open");
    });

    function closeLb() {
      if (lb.parentNode) lb.parentNode.removeChild(lb);
      document.removeEventListener("keydown", onKey, true);
      self._closeLightbox = null;
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeLb();
      }
    }
    lb.onclick = closeLb;
    this._closeLightbox = closeLb;
    document.addEventListener("keydown", onKey, true);
  };

  CrazzyPe.prototype._downloadQrPng = function (src, amountStr, merchantName) {
    if (!src) return;
    var a = document.createElement("a");
    a.href = src;
    a.download = "crazzype-upi-qr.png";
    a.click();
  };

  CrazzyPe.prototype._ensureQr = function (data, slot, opts) {
    if (this._qrActivated) return;
    this._qrActivated = true;
    data._qrStartedAt = Date.now();
    opts = opts || {};

    var preserve = opts.preserveExpiredOverlay || null;
    var keep = [];
    if (preserve && preserve.parentNode === slot) {
      keep.push(preserve);
    }
    while (slot.firstChild) {
      slot.removeChild(slot.firstChild);
    }
    keep.forEach(function (node) {
      slot.appendChild(node);
    });

    var qrSection = this._createQRSection(data);
    if (preserve && preserve.parentNode === slot) {
      slot.insertBefore(qrSection, preserve);
    } else {
      slot.appendChild(qrSection);
    }

    var extrasHost = opts.extrasHost || slot;
    var beforeNode = opts.beforeNode || null;

    if (!opts.skipTimerUi) {
      var timerSection = this._createTimerSection();
      if (opts.timerHost) {
        opts.timerHost.innerHTML = "";
        opts.timerHost.appendChild(timerSection);
      } else if (beforeNode && beforeNode.parentNode === extrasHost) {
        extrasHost.insertBefore(timerSection, beforeNode);
      } else {
        extrasHost.appendChild(timerSection);
      }
    }

    if (this._isBharatPeOrder(data)) {
      var utrBtn = this._createUtrEntryButton(data);
      if (beforeNode && beforeNode.parentNode === extrasHost) {
        extrasHost.insertBefore(utrBtn, beforeNode);
      } else {
        extrasHost.appendChild(utrBtn);
      }
      this._scheduleBharatPeUtrReminder();
    } else {
      this._startPolling();
    }
    this._startTimer();
  };

  /**
   * Create loading state
   */
  CrazzyPe.prototype._createLoadingState = function () {
    var container = document.createElement("div");
    container.className = "cpz-status";

    var icon = document.createElement("div");
    icon.className = "cpz-status-icon processing";
    icon.innerHTML = '<div class="cpz-spinner"></div>';
    container.appendChild(icon);

    var title = document.createElement("div");
    title.className = "cpz-status-title";
    title.textContent = "Initializing Payment";
    container.appendChild(title);

    var message = document.createElement("div");
    message.className = "cpz-status-message";
    message.textContent = "Please wait while we set up your payment...";
    container.appendChild(message);

    return container;
  };

  /**
   * Create header section
   */
  CrazzyPe.prototype._createHeader = function () {
    var header = document.createElement("div");
    header.className = "cpz-header";

    // Logo
    if (this.options.image) {
      var logo = document.createElement("img");
      logo.className = "cpz-logo";
      logo.src = this.options.image;
      logo.alt = this.options.name;
      logo.onerror = function () {
        this.style.display = "none";
      };
      header.appendChild(logo);
    } else {
      var placeholder = document.createElement("div");
      placeholder.className = "cpz-logo-placeholder";
      placeholder.textContent = this.options.name.charAt(0).toUpperCase();
      header.appendChild(placeholder);
    }

    // Merchant info
    var info = document.createElement("div");
    info.className = "cpz-merchant-info";

    var name = document.createElement("div");
    name.className = "cpz-merchant-name";
    name.textContent = this.options.name;

    var badge = document.createElement("span");
    badge.className = "cpz-verified-badge";
    badge.innerHTML = ICONS.check;
    name.appendChild(badge);

    var desc = document.createElement("div");
    desc.className = "cpz-merchant-desc";
    desc.textContent = this.options.description;

    info.appendChild(name);
    info.appendChild(desc);
    header.appendChild(info);

    return header;
  };

  /**
   * Create amount section
   */
  CrazzyPe.prototype._createAmountSection = function (data) {
    var section = document.createElement("div");
    section.className = "cpz-amount-section";

    var label = document.createElement("div");
    label.className = "cpz-amount-label";
    label.textContent = "Total Amount";
    section.appendChild(label);

    var amount = document.createElement("div");
    amount.className = "cpz-amount";

    var currency = document.createElement("span");
    currency.className = "cpz-currency";
    currency.textContent = "\u20B9";
    amount.appendChild(currency);

    var value = document.createElement("span");
    value.textContent = this._formatAmount(this.options.amount);
    amount.appendChild(value);

    section.appendChild(amount);

    if (data && data.order_id) {
      var orderId = document.createElement("div");
      orderId.className = "cpz-order-id";
      orderId.textContent = "Order ID: " + data.order_id;
      section.appendChild(orderId);
    }

    return section;
  };

  /**
   * Create QR code section
   */
  CrazzyPe.prototype._createQRSection = function (data) {
    var section = document.createElement("div");
    section.className = "cpz-qr-section";

    var container = document.createElement("div");
    container.className = "cpz-qr-container";

    var qrData = this._resolveCheckoutQrUrl(data);

    if (qrData) {
      var img = document.createElement("img");
      img.className = "cpz-qr-image";
      img.src = qrData;
      img.alt = "Payment QR Code";
      img.onerror = function () {
        container.innerHTML = "";
        var loading = document.createElement("div");
        loading.className = "cpz-qr-loading";
        loading.innerHTML = '<div class="cpz-spinner"></div>';
        container.appendChild(loading);
      };
      container.appendChild(img);
    } else {
      var loading = document.createElement("div");
      loading.className = "cpz-qr-loading";
      loading.innerHTML = '<div class="cpz-spinner"></div>';
      container.appendChild(loading);
    }

    section.appendChild(container);
    return section;
  };

  /**
   * Create timer section
   */
  CrazzyPe.prototype._createTimerSection = function () {
    var section = document.createElement("div");
    section.className = "cpz-timer-section";

    var circle = document.createElement("div");
    circle.className = "cpz-timer-circle";

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "cpz-timer-svg");
    svg.setAttribute("viewBox", "0 0 40 40");

    var bgCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    bgCircle.setAttribute("class", "cpz-timer-bg");
    bgCircle.setAttribute("cx", "20");
    bgCircle.setAttribute("cy", "20");
    bgCircle.setAttribute("r", "18");

    var progressCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    progressCircle.setAttribute("class", "cpz-timer-progress");
    progressCircle.setAttribute("id", "cpz-timer-progress");
    progressCircle.setAttribute("cx", "20");
    progressCircle.setAttribute("cy", "20");
    progressCircle.setAttribute("r", "18");
    progressCircle.setAttribute("stroke-dasharray", this.timerCircumference);
    progressCircle.setAttribute("stroke-dashoffset", "0");

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);
    circle.appendChild(svg);

    var text = document.createElement("div");
    text.className = "cpz-timer-text";
    text.id = "cpz-timer-text";
    text.textContent = "5:00";
    circle.appendChild(text);

    section.appendChild(circle);

    var label = document.createElement("div");
    label.className = "cpz-timer-label";
    label.textContent = "Time remaining to complete payment";
    section.appendChild(label);

    return section;
  };

  CrazzyPe.prototype._selectMobileApp = function (button, grid, uri) {
    if (!uri || this._successAccepted || this._expiredAt != null) return;
    grid.querySelectorAll("button").forEach(function (item) {
      item.setAttribute("aria-pressed", String(item === button));
    });
    this._selectedMobileIntent = uri;
    if (this._mobileContinue) this._mobileContinue.disabled = false;
  };

  CrazzyPe.prototype._continueMobilePayment = function () {
    if (!this.overlay || !this._selectedMobileIntent || this._successAccepted || this._expiredAt != null) return;
    this._launchUpiWithAndroidFallback(this._selectedMobileIntent, this._selectedMobileIntent);
  };

  /**
   * Launch UPI URI (Android intent:// URLs are skipped)
   */
  CrazzyPe.prototype._launchUpiWithAndroidFallback = function (
    primaryIntent,
    fallbackUpiUri,
  ) {
    var target = this._pickFirstNonPaytmUri([fallbackUpiUri, primaryIntent]);
    if (!target) return;
    window.location.href = target;
  };

  /**
   * Returns true when uri looks Paytm-specific.
   */
  CrazzyPe.prototype._isPaytmUri = function (uri) {
    return /paytm/i.test(uri || "");
  };

  /**
   * Pick first non-empty, non-Paytm URI from list.
   */
  CrazzyPe.prototype._pickFirstNonPaytmUri = function (candidates) {
    var self = this;
    for (var i = 0; i < candidates.length; i++) {
      var value = candidates[i] || "";
      if (value && /^upi:\/\//i.test(value) && !self._isPaytmUri(value))
        return value;
    }
    return "";
  };

  /**
   * Create pay button
   */
  CrazzyPe.prototype._createPayButton = function (data) {
    var self = this;
    var button = document.createElement("button");
    button.className = "cpz-pay-button";
    button.innerHTML = ICONS.smartphone + " <span>Scan and Pay</span>";

    button.onclick = function () {
      if (data) {
        // Generic UPI flow must never auto-resolve to Paytm
        var primaryIntent = self._pickFirstNonPaytmUri([
          data.generic_upi_intent,
          data.upi_link,
          data.upi_intent,
          data.upi_intent_link,
        ]);
        var fallbackUpi = self._pickFirstNonPaytmUri([
          data.generic_upi_intent,
          data.upi_link,
          data.upi_intent,
        ]);
        self._launchUpiWithAndroidFallback(primaryIntent, fallbackUpi);
      }
    };

    return button;
  };

  CrazzyPe.prototype._isBharatPeOrder = function (data) {
    var merchantId = String(
      (data && data.merchantId) ||
        (this.orderDetails && this.orderDetails.merchantId) ||
        "",
    )
      .trim()
      .toLowerCase();
    return merchantId === "bharatpe";
  };

  CrazzyPe.prototype._scheduleBharatPeUtrReminder = function () {
    var self = this;
    if (this.utrPromptTimeout) clearTimeout(this.utrPromptTimeout);
    this.utrPromptTimeout = setTimeout(function () {
      if (!self.overlay || self.utrPromptShown) return;
      self.utrPromptShown = true;
      self._promptBharatPeUtr();
    }, 60000);
  };

  CrazzyPe.prototype._createUtrEntryButton = function (data) {
    var self = this;
    var button = document.createElement("button");
    button.className = "cpz-status-button secondary";
    button.style.marginTop = "8px";
    button.style.width = "100%";
    button.textContent = "Enter UTR";
    button.onclick = function () {
      var orderId =
        self.options.order_id ||
        (data && data.order_id) ||
        (self.orderDetails && self.orderDetails.order_id);
      if (!orderId) return;
      self.utrPromptShown = true;
      self._promptBharatPeUtr(orderId);
    };
    return button;
  };

  /**
   * Create UPI apps section (GPay, PhonePe, Paytm, BHIM - clickable with app intents)
   */
  CrazzyPe.prototype._createUPISection = function (data) {
    var self = this;
    var section = document.createElement("div");
    section.className = "cpz-upi-section";

    var label = document.createElement("div");
    label.className = "cpz-upi-label";
    label.textContent = "Supported UPI Apps";
    section.appendChild(label);

    var apps = document.createElement("div");
    apps.className = "cpz-upi-apps";

    function getIntentForApp(appName, d) {
      if (!d) return "";
      if (appName === "GPay" && d.gpay_intent) return d.gpay_intent;
      if (appName === "PhonePe" && d.phonepe_intent) return d.phonepe_intent;
      if (appName === "Paytm" && d.paytm_intent) return d.paytm_intent;
      if (appName === "BHIM UPI" && (d.generic_upi_intent || d.upi_link))
        return d.generic_upi_intent || d.upi_link;
      // Prevent Paytm icon from silently falling back to generic UPI routing.
      if (appName === "Paytm") return "";
      if (d.generic_upi_intent) return d.generic_upi_intent;
      if (d.upi_link) return d.upi_link;
      return "";
    }

    UPI_APPS.forEach(function (app) {
      var appDiv = document.createElement("div");
      appDiv.className = "cpz-upi-app";
      appDiv.title = app.name + " – Pay with " + app.name;
      var intent = getIntentForApp(app.name, data);
      if (intent) {
        appDiv.style.cursor = "pointer";
        appDiv.addEventListener("click", function () {
          var fallbackUpi = "";
          if (app.name !== "Paytm") {
            fallbackUpi = self._pickFirstNonPaytmUri([
              data && data.generic_upi_intent,
              data && data.upi_link,
              data && data.upi_intent,
            ]);
          }
          self._launchUpiWithAndroidFallback(intent, fallbackUpi);
        });
      }

      var img = document.createElement("img");
      img.src = app.logo;
      img.alt = app.name;
      appDiv.appendChild(img);

      apps.appendChild(appDiv);
    });

    section.appendChild(apps);
    return section;
  };

  /**
   * Create footer
   */
  CrazzyPe.prototype._createFooter = function () {
    var footer = document.createElement("div");
    footer.className = "cpz-footer";

    footer.innerHTML =
      '<span class="cpz-footer-lock">' +
      ICONS.lock +
      "</span>" +
      '<span class="cpz-footer-text">Secured by</span>' +
      '<a href="https://crazzype.com" target="_blank" class="cpz-footer-brand">CrazzyPe</a>';

    return footer;
  };

  CrazzyPe.prototype._getCustomerDetails = function (data) {
    var prefill = this.options.prefill || {};
    var order = data || this.orderDetails || {};
    var name =
      prefill.name ||
      order.customer_name ||
      order.customerName ||
      "";
    var phone =
      prefill.contact ||
      order.customer_mobile ||
      order.customerMobile ||
      order.customer_phone ||
      "";
    var email =
      prefill.email ||
      order.customer_email ||
      order.customerEmail ||
      "";
    return {
      name: String(name || "").trim(),
      phone: String(phone || "").trim(),
      email: String(email || "").trim(),
    };
  };

  CrazzyPe.prototype._formatUsingAs = function (phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) digits = "91" + digits;
    if (digits.length >= 12 && digits.slice(0, 2) === "91") {
      var local = digits.slice(-10);
      return "Using as +91 " + local.slice(0, 5) + " " + local.slice(5);
    }
    if (String(phone || "").trim()) {
      return "Using as " + String(phone).trim();
    }
    return "";
  };

  CrazzyPe.prototype._createCustomerRowContent = function (customer) {
    var wrap = document.createElement("div");
    wrap.className = "cpz-rzp-user-row-left";
    wrap.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    var meta = document.createElement("div");
    meta.className = "cpz-rzp-user-meta";
    var label = this._formatUsingAs(customer.phone) || customer.name || customer.email || "";
    meta.textContent = label;
    meta.title = label;
    wrap.appendChild(meta);
    return wrap;
  };

  CrazzyPe.prototype._createCoinMarkup = function () {
    return (
      '<div class="cpz-coin-stage" aria-hidden="true">' +
      '<div class="cpz-halo-ring"></div>' +
      '<div class="cpz-3d-coin">' +
      '<div class="cpz-coin-face cpz-coin-front"><div class="cpz-coin-inner-rim"></div><div class="cpz-coin-sheen"></div></div>' +
      '<div class="cpz-coin-face cpz-coin-back"><div class="cpz-coin-inner-rim"></div><div class="cpz-coin-sheen"></div></div>' +
      "</div></div>"
    );
  };

  CrazzyPe.prototype._buildCoinSheetChrome = function () {
    var wrap = document.createElement("div");
    wrap.className = "cpz-sheet-coin-wrap";
    wrap.innerHTML =
      '<div class="cpz-ripple" aria-hidden="true"></div>' +
      '<div class="cpz-ripple" aria-hidden="true"></div>' +
      '<div class="cpz-ripple" aria-hidden="true"></div>' +
      '<div class="cpz-streaks" aria-hidden="true"><span></span><span></span><span></span></div>' +
      this._createCoinMarkup();
    return wrap;
  };

  /** One confirming state; 900ms minimum plus 450ms exit (1050ms reduced motion). */
  CrazzyPe.prototype._beginProcessingFlow = function (successData) {
    var self = this;
    if (this._successAccepted) return;
    this._successAccepted = true;
    this._pendingSuccess = successData || {};
    clearInterval(this.paymentTimer);
    clearInterval(this.pollingInterval);
    this.paymentTimer = this.pollingInterval = null;
    this._clearSheetTimers();
    this._confirmingUntil = performance.now() + 900;
    this._showConfirmingSheet();
    var session = this._session;
    this._sheetTimer = setTimeout(function () {
      if (self._session !== session || !self.overlay) return;
      self._confirmingReady = true;
      if (self._state === "close-during-confirming") return;
      self._completeConfirming();
    }, 900);
  };

  CrazzyPe.prototype._showConfirmingSheet = function () {
    this._renderSheet({ state: "confirming", art: COIN_SVG, accent: "var(--cp-warning)", title: "Confirming payment", body: "This will only take a few seconds.", secured: true });
  };

  CrazzyPe.prototype._completeConfirming = function () {
    var self = this;
    var session = this._session;
    if (this._activeSheet) this._activeSheet.classList.add("is-coin-exit");
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._sheetTimer = setTimeout(function () {
      if (self._session === session && self.overlay && self._state !== "close-during-confirming") self._showSuccessSheet(self._pendingSuccess || {});
    }, reduced ? 150 : 450);
  };

  CrazzyPe.prototype._merchantDisplayName = function () {
    return (this.options && this.options.name) || "the merchant";
  };

  CrazzyPe.prototype._getSupportContacts = function () {
    var s = (this.options && this.options.support) || {};
    var email = String(s.email || "").trim(), phone = String(s.phone || "").trim(), url = String(s.url || "").trim();
    return {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
      phone: /^\+?[\d\s().-]+$/.test(phone) ? phone : "",
      url: /^https?:\/\//i.test(url) ? url : "",
    };
  };

  CrazzyPe.prototype._supportFooterPlainText = function () {
    var name = this._merchantDisplayName();
    var c = this._getSupportContacts();
    var lines = ["For support, contact " + name];
    if (c.email) lines.push(c.email);
    if (c.phone) lines.push(c.phone);
    if (c.url) lines.push(c.url);
    return lines;
  };

  CrazzyPe.prototype._openMerchantSupport = function () {
    var c = this._getSupportContacts();
    if (c.url) {
      window.open(c.url, "_blank", "noopener");
      return;
    }
    if (c.email) {
      window.location.href = "mailto:" + c.email;
      return;
    }
    if (c.phone) {
      window.location.href = "tel:" + c.phone.replace(/\s+/g, "");
      return;
    }
    this._announce("Contact " + this._merchantDisplayName() + " for support");
  };

  CrazzyPe.prototype._copyTextWithFeedback = function (text, btn) {
    var done = function (success) {
      if (!btn) return;
      var prev = btn.textContent;
      btn.textContent = success ? "Copied \u2713" : "Copy unavailable";
      setTimeout(function () { btn.textContent = prev; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(String(text)).then(function () { done(true); }).catch(function () { done(false); });
    } else done(false);
  };

  CrazzyPe.prototype._appendMerchantSupportBlock = function (parent, options) {
    options = options || {};
    var name = this._merchantDisplayName();
    var c = this._getSupportContacts();
    var hasContacts = !!(c.email || c.phone || c.url);
    var block = document.createElement("div");
    block.className = "cpz-support-block";

    if (options.leadText) {
      var lead = document.createElement("div");
      lead.className = "cpz-support-line";
      lead.textContent = options.leadText;
      block.appendChild(lead);
    }

    if (hasContacts) {
      var links = document.createElement("div");
      links.className = "cpz-support-links";
      if (c.email) {
        var mail = document.createElement("a");
        mail.href = "mailto:" + c.email;
        mail.textContent = c.email;
        links.appendChild(mail);
      }
      if (c.phone) {
        var tel = document.createElement("a");
        tel.href = "tel:" + c.phone.replace(/\s+/g, "");
        tel.textContent = c.phone;
        links.appendChild(tel);
      }
      if (c.url) {
        var web = document.createElement("a");
        web.href = c.url;
        web.target = "_blank";
        web.rel = "noopener noreferrer";
        web.textContent = c.url;
        links.appendChild(web);
      }
      block.appendChild(links);
    } else if (!options.suppressFallback) {
      var fallback = document.createElement("div");
      fallback.className = "cpz-support-line";
      fallback.textContent = "Contact " + name + " for support";
      block.appendChild(fallback);
    }

    parent.appendChild(block);
    return block;
  };

  CrazzyPe.prototype._appendPaymentIdRow = function (parent, paymentId) {
    paymentId = (paymentId || "").toString().trim();
    if (!paymentId) return null;
    var self = this;
    var row = document.createElement("div");
    row.className = "cpz-pay-id-row";
    var label = document.createElement("span");
    label.textContent = "Payment ID: " + paymentId;
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "cpz-pay-id-copy";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy Payment ID");
    copyBtn.onclick = function () {
      self._copyTextWithFeedback(paymentId, copyBtn);
    };
    row.appendChild(label);
    row.appendChild(copyBtn);
    parent.appendChild(row);
    return row;
  };

  CrazzyPe.prototype._downloadPaymentReceipt = function (data) {
    data = data || {};
    var canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 640;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var merchant = this._merchantDisplayName();
    var amountStr = this._formatAmount(this.options.amount);
    var payId =
      data.payment_id || data.order_id || this.options.order_id || "";
    var when = "";
    var paymentTime = data.payment_timestamp || data.transactionDate;
    if (paymentTime && Number.isFinite(new Date(paymentTime).getTime())) {
      when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(paymentTime));
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#292f32";
    ctx.textAlign = "center";
    ctx.font = "700 22px sans-serif";
    ctx.fillText("Payment receipt", 240, 48);
    ctx.font = "600 16px sans-serif";
    ctx.fillText(merchant, 240, 90);
    ctx.font = "700 28px sans-serif";
    ctx.fillText(amountStr, 240, 136);
    ctx.font = "400 13px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(when, 240, 170);
    if (payId) {
      ctx.fillText("UPI | " + payId, 240, 198);
    }
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(40, 230, 400, 1);
    ctx.fillStyle = "#475569";
    ctx.font = "400 13px sans-serif";
    var footerLines = this._supportFooterPlainText();
    var y = 270;
    for (var i = 0; i < footerLines.length; i++) {
      ctx.fillText(footerLines[i], 240, y);
      y += 22;
    }
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 12px sans-serif";
    ctx.fillText("Secured by CrazzyPe", 240, 600);
    if (data._shareReceipt && navigator.canShare && navigator.share) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], "crazzype-payment-receipt.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).catch(function () {});
      }, "image/png");
      return;
    }
    try {
      var a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "crazzype-payment-receipt.png";
      a.click();
    } catch (err) {
      /* ignore */
    }
  };

  CrazzyPe.prototype._showSuccessSheet = function (data) {
    if (this._successShown) return;
    this._successShown = true;
    this._setState("success");
    var self = this;
    data = data || {};
    this._successAccepted = true;
    clearInterval(this.paymentTimer); clearInterval(this.pollingInterval);
    this.paymentTimer = this.pollingInterval = null;
    var explicitCallback = this.options.callback_url || "";
    var redirectUrl = explicitCallback
      ? data.redirect_url || explicitCallback
      : "";
    var merchantName = this._merchantDisplayName();

    var sheet = document.createElement("div");
    sheet.className = "cpz-success-pane";
    sheet.setAttribute("role", "region");
    sheet.setAttribute("aria-labelledby", "cpz-success-title");

    var live = document.createElement("div");
    live.className = "cpz-sheet-live";
    live.textContent = "You will be redirected in 5 seconds";

    var title = document.createElement("div");
    title.className = "cpz-sheet-title";
    title.textContent = "Payment Successful";
    title.id = "cpz-success-title";
    title.tabIndex = -1;

    var badge = document.createElement("div");
    badge.className = "cpz-success-badge";
    badge.innerHTML = SUCCESS_SVG;

    var receipt = document.createElement("div");
    receipt.className = "cpz-receipt";

    var row = document.createElement("div");
    row.className = "cpz-receipt-row";
    var merchant = document.createElement("strong");
    merchant.textContent = merchantName;
    merchant.title = merchant.textContent;
    var amount = document.createElement("span");
    amount.textContent = this._formatAmount(this.options.amount);
    row.appendChild(merchant);
    row.appendChild(amount);

    var meta = document.createElement("div");
    meta.className = "cpz-receipt-meta";
    var paymentTime = data.payment_timestamp || data.transactionDate;
    if (paymentTime && Number.isFinite(new Date(paymentTime).getTime())) {
      meta.textContent = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(paymentTime));
    } else meta.hidden = true;

    var payRow = document.createElement("div");
    payRow.className = "cpz-receipt-pay";
    var payId = data.payment_id || data.order_id || this.options.order_id || "";
    var payText = document.createElement("span");
    payText.textContent = "UPI | " + (payId.length > 26 ? payId.slice(0, 12) + "\u2026" + payId.slice(-10) : payId);
    payText.title = payId;
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "cpz-receipt-copy";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = function () {
      self._copyTextWithFeedback(payId, copyBtn);
      pauseForCopy();
    };
    payRow.appendChild(payText);
    payRow.appendChild(copyBtn);

    var foot = document.createElement("div");
    foot.className = "cpz-receipt-foot";
    foot.textContent =
      "\u24D8 For any questions about this payment, contact " + merchantName;

    var dlBtn = document.createElement("button");
    dlBtn.type = "button";
    dlBtn.className = "cpz-receipt-download";
    dlBtn.textContent = "Download receipt";
    dlBtn.onclick = function () {
      self._downloadPaymentReceipt(data);
    };

    receipt.appendChild(row);
    receipt.appendChild(meta);
    receipt.appendChild(payRow);
    if (data.utr || data.UTR) this._appendReferenceRow(receipt, "UTR", data.utr || data.UTR);
    receipt.appendChild(foot);
    var contacts = this._getSupportContacts();
    if (contacts.email || contacts.phone || contacts.url) {
      var linksOnly = document.createElement("div");
      linksOnly.className = "cpz-support-links";
      linksOnly.style.marginTop = "8px";
      if (contacts.email) {
        var mail = document.createElement("a");
        mail.href = "mailto:" + contacts.email;
        mail.textContent = contacts.email;
        linksOnly.appendChild(mail);
      }
      if (contacts.phone) {
        var tel = document.createElement("a");
        tel.href = "tel:" + contacts.phone.replace(/\s+/g, "");
        tel.textContent = contacts.phone;
        linksOnly.appendChild(tel);
      }
      if (contacts.url) {
        var web = document.createElement("a");
        web.href = contacts.url;
        web.target = "_blank";
        web.rel = "noopener noreferrer";
        web.textContent = contacts.url;
        linksOnly.appendChild(web);
      }
      receipt.appendChild(linksOnly);
    }
    receipt.appendChild(dlBtn);
    if (window.innerWidth < 768 && navigator.canShare && navigator.share && typeof File !== "undefined" && navigator.canShare({ files: [new File([""], "receipt.png", { type: "image/png" })] })) {
      var share = document.createElement("button"); share.type = "button"; share.className = "cpz-receipt-download"; share.textContent = "Share";
      share.onclick = function () { self._downloadPaymentReceipt(Object.assign({}, data, { _shareReceipt: true })); };
      receipt.appendChild(share);
    }

    var secured = document.createElement("div");
    secured.className = "cpz-sheet-secured";
    secured.innerHTML = ICONS.lock + "<span>Secured by CrazzyPe</span>";

    sheet.appendChild(live);
    sheet.appendChild(title);
    sheet.appendChild(badge);
    sheet.appendChild(receipt);
    sheet.appendChild(secured);

    if (this.sheetHost) {
      this.sheetHost.innerHTML = "";
      this.sheetHost.appendChild(sheet);
      this._activeSheet = sheet;
      this._setShellDimmed(false);
      if (this.checkoutRoot) this.checkoutRoot.classList.add("cpz-paid");
    }
    this._loadStateAnimation(badge, "success");
    this._sheetEscape = null;
    title.focus();
    var announcement = document.createElement("div");
    announcement.className = "cpz-aria-live";
    announcement.setAttribute("aria-live", "assertive");
    sheet.appendChild(announcement);
    requestAnimationFrame(function () {
      badge.classList.add("is-in");
      announcement.textContent = "Payment successful, " + self._formatAmount(self.options.amount) + " paid to " + merchantName;
    });

    var response = {
      crazzype_payment_id: data.payment_id || data.order_id,
      crazzype_order_id: data.order_id || this.options.order_id,
      crazzype_signature: data.signature || data.hash,
      order_id: data.order_id || this.options.order_id,
      payment_id: data.payment_id,
      signature: data.signature || data.hash,
      redirect_url: redirectUrl || explicitCallback || "",
    };

    this._successResponse = response;
    this._successRedirect = redirectUrl;
    var remaining = 5000, lastTick = performance.now(), hovered = false, focused = false, resumeAt = 0, paused = false;
    function paintCountdown() {
      var now = performance.now();
      var hold = hovered || focused || now < resumeAt;
      if (!hold && !paused) remaining = Math.max(0, remaining - (now - lastTick));
      lastTick = now;
      if (hold) {
        live.textContent = "Paused";
        if (!paused) self._announce("Paused");
      } else {
        var seconds = Math.ceil(remaining / 1000);
        live.textContent = "You will be redirected in " + seconds + (seconds === 1 ? " second" : " seconds");
      }
      paused = hold;
      if (remaining === 0) {
        clearInterval(self._redirectTimer); self._redirectTimer = null;
        sheet.classList.add("is-closing");
        var session = self._session;
        self._sheetTimer = setTimeout(function () { if (self._session === session && self.overlay) self._finishSuccess(response, explicitCallback, redirectUrl); }, 220);
      }
    }
    function pauseForCopy() { resumeAt = performance.now() + 2000; paintCountdown(); }
    receipt.onpointerenter = function () { hovered = true; paintCountdown(); };
    receipt.onpointerleave = function () { hovered = false; resumeAt = performance.now() + 2000; paintCountdown(); };
    receipt.onfocusin = function () { focused = true; paintCountdown(); };
    receipt.onfocusout = function (event) { if (!receipt.contains(event.relatedTarget)) { focused = false; resumeAt = performance.now() + 2000; paintCountdown(); } };
    receipt.addEventListener("click", function (event) { if (event.target.closest("button")) pauseForCopy(); });
    this._clearSheetTimers();
    this._announce("You will be redirected in 5 seconds");
    this._redirectTimer = setInterval(paintCountdown, 100);
  };

  CrazzyPe.prototype._finishSuccess = function (response, explicitCallback, redirectUrl) {
    if (this._successFinished) return;
    this._successFinished = true;
    var self = this;
    try {
      if (typeof this.options.handler === "function") {
        this.options.handler(response);
      }
    } catch (err) {
      console.error("CrazzyPe: handler error", err);
    }
    try {
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess(response);
      }
    } catch (err2) {
      console.error("CrazzyPe: onSuccess error", err2);
    }

    if (explicitCallback) {
      window.location.href = redirectUrl || explicitCallback;
    } else {
      self.close();
    }
  };

  CrazzyPe.prototype._runSuccessSequence = function (data) {
    this._beginProcessingFlow(data);
  };

  CrazzyPe.prototype._showFailureSheet = function (data) {
    var self = this;
    data = data || {};
    var reasons = {
      "bank-declined": "Your bank declined this payment.",
      "user-cancelled": "The payment was cancelled in your UPI app.",
      "incorrect-pin": "The UPI PIN entered was incorrect.",
      "limit-exceeded": "This payment is over your UPI limit for today.",
      "insufficient-funds": "Your account doesn't have enough balance.",
      "timed-out": "The payment request timed out."
    };
    var reason = Object.prototype.hasOwnProperty.call(reasons, data.reason) ? data.reason : "unknown";
    this._renderSheet({ state: "failure-" + reason, art: FAIL_SVG, accent: "var(--cp-error)", title: "Payment failed", body: reasons[reason] || "We couldn't complete this payment.", details: function (sheet) {
      var help = document.createElement("p");
      help.className = "cpz-support-line";
      help.textContent = "If money was deducted from your account, please contact " + self._merchantDisplayName() + " with your Payment ID for help.";
      sheet.appendChild(help);
      self._appendPaymentIdRow(sheet, data.payment_id || data.upi_txn_id);
      if (data.utr || data.UTR) self._appendReferenceRow(sheet, "UTR", data.utr || data.UTR);
      self._appendMerchantSupportBlock(sheet, { suppressFallback: true });
      if (data.code || data.error_code) {
        var details = document.createElement("details");
        var summary = document.createElement("summary"); summary.textContent = "Details";
        var code = document.createElement("code"); code.textContent = String(data.code || data.error_code);
        details.appendChild(summary); details.appendChild(code); sheet.appendChild(details);
      }
    }, outline: { label: "Close", run: function () { self.close(); } }, primary: { label: "Try again", run: function () {
      if (self._merchantOrderId) self._showStartupError({ message: "Please close this checkout and start a new payment", retryable: false });
      else self._restartPayment();
    } } });
  };

  CrazzyPe.prototype._appendReferenceRow = function (parent, label, value) {
    if (!value) return;
    var self = this;
    var row = document.createElement("div"); row.className = "cpz-pay-id-row";
    var text = document.createElement("span"); text.textContent = label + ": " + value; text.title = String(value);
    var copy = document.createElement("button"); copy.type = "button"; copy.className = "cpz-pay-id-copy"; copy.textContent = "Copy";
    copy.onclick = function () { self._copyTextWithFeedback(String(value), copy); };
    row.appendChild(text); row.appendChild(copy); parent.appendChild(row);
  };

  CrazzyPe.prototype._showPendingSheet = function (data) {
    var self = this;
    data = data || {};
    if (this._pendingSheetShown || this._successAccepted) return;
    this._pendingSheetShown = true;
    this._renderSheet({ state: "pending", art: HOURGLASS_SVG, accent: "var(--cp-warning)", title: "Payment is being confirmed", body: "Your bank is taking a little longer. Please don't pay again \u2014 we'll update this automatically.", details: function (sheet) {
      var checked = document.createElement("p"); checked.className = "cpz-last-checked";
      self._lastCheckedLabel = checked; sheet.appendChild(checked); self._paintLastChecked();
      var help = document.createElement("p"); help.className = "cpz-support-line";
      help.textContent = "If money was deducted and this doesn't update, contact " + self._merchantDisplayName() + " with your Payment ID.";
      sheet.appendChild(help);
      self._appendPaymentIdRow(sheet, data.payment_id || data.upi_txn_id);
      self._appendMerchantSupportBlock(sheet, { suppressFallback: true });
    }, outline: { label: "Close", run: function () { self.close(); } }, primary: { label: "Check status now", run: function () { if (self._pollNow) self._pollNow(true); } } });
  };

  CrazzyPe.prototype._paintLastChecked = function () {
    if (this._lastCheckedLabel) this._lastCheckedLabel.textContent = this._lastCheckedAt == null ? "Checking status\u2026" : "Last checked " + Math.floor((performance.now() - this._lastCheckedAt) / 1000) + "s ago";
  };

  CrazzyPe.prototype._showCancelConfirm = function () {
    var self = this;
    if (this._successAccepted) { this._showCloseDuringConfirming(); return; }
    this._renderSheet({ state: "exit-confirm", art: EXIT_SVG, title: "Leave this payment?", body: "You'll go back to " + this._merchantDisplayName() + ".", outline: { label: "Continue paying", run: function () { self._clearSheet(); self._focusFirstInOverlay(); } }, primary: { label: "Yes, leave", run: function () { self.close(); } } });
  };

  /** Kept for older call sites — routes to Frame 1 loader. */
  CrazzyPe.prototype._createLoadingState = function () {
    return this._createFrameLoader();
  };

  // Client-side deadline from qr_timeout_seconds; replace with server expires_at if the API adds it.
  CrazzyPe.prototype._anchorQrDeadline = function (duration, roundTripMs) {
    var seconds = Number(duration);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error("Invalid QR timeout duration");
    }
    var margin = Math.min(10000, Math.max(3000, Number(roundTripMs) || 0));
    this._qrExpiresAt = performance.now() + seconds * 1000 - margin;
  };

  CrazzyPe.prototype._expireQr = function () {
    if (this._successAccepted || !this.overlay) return;
    if (this._expiredAt != null) return;
    this._expiredAt = performance.now();
    this._qrExpiresAt = this._expiredAt;
    this.timeLeft = 0;
    this._qrActivated = false;
    clearInterval(this.paymentTimer);
    this.paymentTimer = null;
    this._onVisibilityResync = null;
    if (this.overlay.querySelectorAll) {
      this.overlay.querySelectorAll(".cpz-rzp-timer, .cpz-timer-section").forEach(function (timer) {
        timer.remove();
      });
    }
    if (this._activeSheet || this._state === "overflow-menu") this._resumeState = "qr-expired";
    else this._setState("qr-expired");
    this._announce("QR code expired");
    if (typeof this._onQrExpired === "function") this._onQrExpired();
    else this._handleFailure({ error_description: "Payment timeout" });
  };

  /** Start payment timer only after receiving the QR response. */
  CrazzyPe.prototype._startTimer = function () {
    var self = this;
    if (this._qrExpiresAt == null) return;
    clearInterval(this.paymentTimer);
    this._timerAnnounced = { sixty: false, thirty: false, expired: false };
    var nearExpiryNotified = false;

    function syncFromDeadline() {
      self.timeLeft = Math.max(
        0,
        Math.ceil((self._qrExpiresAt - performance.now()) / 1000),
      );
    }

    function paintTimer() {
      syncFromDeadline();
      var minutes = Math.floor(self.timeLeft / 60);
      var seconds = self.timeLeft % 60;
      var formatted =
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds;

      var timerText = document.getElementById("cpz-timer-text");
      if (timerText) timerText.textContent = formatted;
      var slimTimer = document.getElementById("cpz-rzp-timer-text");
      if (slimTimer) slimTimer.textContent = formatted;

      var pill = document.getElementById("cpz-rzp-timer-label");
      if (pill && !pill.classList.contains("is-expired")) {
        pill.classList.remove("is-warn", "is-danger");
        if (self.timeLeft <= 60) pill.classList.add("is-danger");
      }

      var progress = document.getElementById("cpz-timer-progress");
      if (progress) {
        var offset =
          self.timerCircumference * (1 - self.timeLeft / self.qrTimeoutSeconds);
        progress.setAttribute("stroke-dashoffset", offset);
        progress.classList.remove("warning", "danger");
        if (self.timeLeft <= 30) {
          progress.classList.add("danger");
        } else if (self.timeLeft <= 60) {
          progress.classList.add("warning");
        }
      }

      if (self.timeLeft <= 60 && self.timeLeft > 0 && !nearExpiryNotified) {
        nearExpiryNotified = true;
        if (typeof self._setQrNearExpiry === "function") self._setQrNearExpiry();
      }

      if (self.timeLeft === 60 && !self._timerAnnounced.sixty) {
        self._timerAnnounced.sixty = true;
        self._announce("One minute remaining to complete payment");
      } else if (self.timeLeft === 30 && !self._timerAnnounced.thirty) {
        self._timerAnnounced.thirty = true;
        self._announce("Thirty seconds remaining to complete payment");
      }
    }

    function tick() {
      if (!self._qrActivated) return;
      paintTimer();
      if (self.timeLeft === 0) self._expireQr();
    }

    this._onVisibilityResync = tick;
    tick();
    if (this._qrActivated) this.paymentTimer = setInterval(tick, 1000);
  };

  /** Private transport seam: resolves the parsed check-order-status JSON body. */
  CrazzyPe.prototype._fetchOrderStatus = function (orderId) {
    return fetch(apiOrdersUrl("/api/orders/check-order-status"), {
      method: "POST",
      headers: apiAuthHeaders(this.options.key),
      body: JSON.stringify({ order_id: orderId }),
    }).then(function (res) {
      return res.json();
    });
  };

  /**
   * Start polling for payment status
   */
  CrazzyPe.prototype._startPolling = function () {
    var self = this;
    var orderId =
      this.options.order_id ||
      (this.orderDetails && this.orderDetails.order_id);

    if (!orderId) return;

    var session = this._session;
    var inFlight = false;
    var pendingSince = null, nextPollAt = 0, pendingPolls = 0;
    clearInterval(this.pollingInterval);
    function poll(force) {
      self._paintLastChecked();
      if (!force && performance.now() < nextPollAt) return;
      if (!self.overlay || self._session !== session || self._successAccepted || inFlight) return;
      if (self._qrExpiresAt != null && performance.now() >= self._qrExpiresAt) self._expireQr();
      if (self._expiredAt != null && performance.now() - self._expiredAt > 60000) {
        clearInterval(self.pollingInterval);
        self.pollingInterval = null;
        return;
      }
      if (navigator.onLine === false) { self._showOfflineSheet(); return; }
      inFlight = true;
      nextPollAt = performance.now() + 2000;
      self._fetchOrderStatus(orderId)
        .then(function (data) {
          inFlight = false;
          if (!self.overlay || self._session !== session || self._successAccepted) return;
          self._lastCheckedAt = performance.now();
          if (self._state === "offline") { self._clearSheet(); self._pendingSheetShown = false; }
          var expired = [data.txn_status, data.status, data.data && data.data.status]
            .some(function (value) { return /^(?:QR_|ORDER_|TXN_)?EXPIRED$/i.test(String(value || "")); });
          // The existing API also represents expiry as TXN_FAILED with this message.
          if (!(data.status === "success" && data.txn_status === "TXN_SUCCESS") &&
              (expired || (data.txn_status === "TXN_FAILED" && /(?:QR|order).*expired/i.test(data.message || "")))) {
            self._expireQr();
            return;
          }
          if (data.status === "success" && data.txn_status === "TXN_SUCCESS") {
            clearInterval(self.pollingInterval);
            clearInterval(self.paymentTimer);

            var hash = "";
            var redirectUrl =
              (data.data && data.data.redirect_url) ||
              self.options.callback_url ||
              "";
            if (redirectUrl) {
              var hashMatch = redirectUrl.match(/hash=([^&]+)/);
              if (hashMatch) hash = decodeURIComponent(hashMatch[1]);
            }

            self._beginProcessingFlow({
              order_id: orderId,
              payment_id: data.data && data.data.upi_txn_id,
              signature: hash,
              hash: hash,
              redirect_url: redirectUrl,
              utr: data.data && (data.data.utr || data.data.UTR),
              payment_timestamp: data.data && (data.data.payment_timestamp || data.data.transactionDate),
            });
          } else if (self._expiredAt != null) {
            return;
          } else if (
            data.txn_status === "TXN_FAILED" ||
            data.txn_status === "TXN_ALREADY_PROCESSED" ||
            data.txn_status === "AMOUNT_TAMPERED"
          ) {
            clearInterval(self.pollingInterval);
            clearInterval(self.paymentTimer);
            self._handleFailure({
              error_description: data.message || "Payment could not be completed",
              payment_id: data.data && data.data.upi_txn_id,
              utr: data.data && (data.data.utr || data.data.UTR),
            });
          } else if (
            data.txn_status === "TXN_PENDING" ||
            data.txn_status === "TXN_IN_PROGRESS"
          ) {
            if (pendingSince == null) pendingSince = performance.now();
            if (performance.now() - pendingSince >= 20000) {
              self._showPendingSheet({ payment_id: data.data && data.data.upi_txn_id });
              nextPollAt = performance.now() + (pendingPolls === 0 ? 3000 : pendingPolls === 1 ? 5000 : 10000);
              pendingPolls++;
            }
          } else if (
            data.txn_status === "MISSING_PARAMETER" &&
            !self.utrPromptShown
          ) {
            self.utrPromptShown = true;
            clearInterval(self.pollingInterval);
            self.utrPromptTimeout = setTimeout(function () {
              self._promptBharatPeUtr(orderId);
            }, 60000);
          }
        })
        .catch(function (error) {
          inFlight = false;
          if (!self.overlay || self._session !== session || self._successAccepted) return;
          self._showOfflineSheet();
          console.error("CrazzyPe: Status check error", error);
        });
    }
    this._pollNow = poll;
    this.pollingInterval = setInterval(poll, 1000);
  };

  CrazzyPe.prototype._promptBharatPeUtr = function (orderId) {
    var self = this;
    var resolvedOrderId =
      orderId ||
      this.options.order_id ||
      (this.orderDetails && this.orderDetails.order_id);
    if (!resolvedOrderId) return;

    var session = this._session;
    self._openUtrModal().then(function (normalizedUtr) {
      if (!normalizedUtr || !self.overlay || self._session !== session || self._successAccepted) return;
      self._verifyBharatPeUtr(resolvedOrderId, normalizedUtr);
    });
  };

  CrazzyPe.prototype._verifyBharatPeUtr = function (orderId, normalizedUtr) {
    var self = this;
    var session = this._session;

    fetch(apiOrdersUrl("/api/orders/check-order-status"), {
      method: "POST",
      headers: apiAuthHeaders(self.options.key),
      body: JSON.stringify({
        order_id: orderId,
        utr: normalizedUtr,
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!self.overlay || self._session !== session || self._successAccepted) return;
        if (data.status === "success" && data.txn_status === "TXN_SUCCESS") {
          self._closeUtrModal();
          clearInterval(self.paymentTimer);
          var hash = "";
          var redirectUrl =
            (data.data && data.data.redirect_url) ||
            self.options.callback_url ||
            "";
          if (redirectUrl) {
            var hashMatch = redirectUrl.match(/hash=([^&]+)/);
            if (hashMatch) hash = decodeURIComponent(hashMatch[1]);
          }
          self._beginProcessingFlow({
            order_id: orderId,
            payment_id: data.data && data.data.upi_txn_id,
            signature: hash,
            hash: hash,
            redirect_url: redirectUrl,
            utr: data.data && (data.data.utr || data.data.UTR),
            payment_timestamp: data.data && (data.data.payment_timestamp || data.data.transactionDate),
          });
          return;
        }

        if (data.txn_status === "TXN_ALREADY_PROCESSED") {
          self._closeUtrModal();
          clearInterval(self.pollingInterval);
          clearInterval(self.paymentTimer);
          self._handleFailure({
            error_description:
              data.message ||
              "This UTR is already linked to another transaction. Transaction has been stopped.",
          });
          return;
        }

        if (data.txn_status === "AMOUNT_TAMPERED") {
          var amtMsg =
            data.amt != null && data.amtt != null
              ? "Amount tampered. Order: \u20B9" +
                data.amt +
                ", paid: \u20B9" +
                data.amtt +
                "."
              : data.message ||
                "Amount tampered. Paid amount does not match order amount.";
          self._openUtrModal({ errorMessage: amtMsg }).then(function (retryUtr) {
            if (retryUtr && self.overlay && self._session === session && !self._successAccepted) self._verifyBharatPeUtr(orderId, retryUtr);
          });
          return;
        }

        if (data.status === "error" && data.message) {
          self._openUtrModal({ errorMessage: data.message });
          return;
        }

        self._openUtrModal({
          errorMessage:
            data.message ||
            "Payment not found yet. Confirm UTR and try again.",
        }).then(function (retryUtr) {
          if (retryUtr && self.overlay && self._session === session && !self._successAccepted) self._verifyBharatPeUtr(orderId, retryUtr);
        });
      })
      .catch(function () {
        if (!self.overlay || self._session !== session || self._successAccepted) return;
        self._openUtrModal({
          errorMessage: "Unable to verify payment right now. Please try again.",
        }).then(function (retryUtr) {
          if (retryUtr && self.overlay && self._session === session && !self._successAccepted) self._verifyBharatPeUtr(orderId, retryUtr);
        });
      });
  };

  CrazzyPe.prototype._showInlineNotice = function (message) {
    var notice = document.createElement("div");
    notice.style.position = "fixed";
    notice.style.left = "50%";
    notice.style.bottom = "24px";
    notice.style.transform = "translateX(-50%)";
    notice.style.background = "#111827";
    notice.style.color = "#ffffff";
    notice.style.padding = "10px 14px";
    notice.style.borderRadius = "8px";
    notice.style.fontSize = "13px";
    notice.style.zIndex = "999999";
    notice.textContent = message || "Something went wrong";
    document.body.appendChild(notice);
    setTimeout(function () {
      if (notice && notice.parentNode) notice.parentNode.removeChild(notice);
    }, 2500);
  };

  CrazzyPe.prototype._closeUtrModal = function () {
    if (this.utrLayer && this.utrLayer.parentNode) {
      this.utrLayer.parentNode.removeChild(this.utrLayer);
    }
    this.utrLayer = null;
  };

  CrazzyPe.prototype._openUtrModal = function (options) {
    var self = this;
    options = options || {};

    return new Promise(function (resolve) {
      if (!self.overlay) {
        resolve(null);
        return;
      }
      self._closeUtrModal();

      var backdrop = document.createElement("div");
      backdrop.className = "cpz-utr-overlay";

      var panel = document.createElement("div");
      panel.className = "cpz-utr-card";

      var head = document.createElement("div");
      head.className = "cpz-utr-head";

      var title = document.createElement("div");
      title.className = "cpz-utr-title";
      title.textContent = "Payment done?";
      head.appendChild(title);

      var pill = document.createElement("div");
      pill.className = "cpz-utr-pill";
      pill.textContent = "BharatPe";
      head.appendChild(pill);
      panel.appendChild(head);

      var desc = document.createElement("div");
      desc.className = "cpz-utr-desc";
      desc.textContent =
        "Enter UTR / bank reference number to verify your BharatPe payment.";
      panel.appendChild(desc);

      var input = document.createElement("input");
      input.type = "text";
      input.className = "cpz-utr-input";
      input.placeholder = "Enter UTR";
      input.autocomplete = "off";
      panel.appendChild(input);

      var error = document.createElement("div");
      error.className = "cpz-utr-hint";
      if (options.errorMessage) {
        error.textContent = options.errorMessage;
        error.classList.add("error");
      } else {
        error.textContent = "Only one-time UTR is accepted.";
      }
      panel.appendChild(error);

      var actions = document.createElement("div");
      actions.className = "cpz-utr-actions";

      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "cpz-status-button secondary";
      cancel.textContent = "Continue waiting";

      var confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "cpz-status-button";
      confirm.textContent = "Verify Payment";

      actions.appendChild(cancel);
      actions.appendChild(confirm);
      panel.appendChild(actions);
      backdrop.appendChild(panel);
      self.overlay.appendChild(backdrop);
      self.utrLayer = backdrop;
      setTimeout(function () {
        input.focus();
      }, 20);

      function close(value) {
        self._closeUtrModal();
        resolve(value);
      }

      cancel.onclick = function () {
        close(null);
      };
      backdrop.onclick = function (e) {
        if (e.target === backdrop) close(null);
      };
      confirm.onclick = function () {
        var normalized = String(input.value || "")
          .replace(/\s+/g, "")
          .replace(/[^0-9A-Za-z]/g, "")
          .toUpperCase();
        if (normalized.length < 6) {
          error.textContent = "Please enter a valid UTR.";
          error.classList.add("error");
          return;
        }
        confirm.disabled = true;
        cancel.disabled = true;
        confirm.textContent = "Verifying...";
        close(normalized);
      };
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") confirm.click();
      });
    });
  };

  /**
   * Validate origin
   */
  CrazzyPe.prototype._validateOrigin = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      fetch(apiOrdersUrl("/api/orders/check-incognito-feature"), {
        method: "GET",
        headers: apiAuthHeaders(self.options.key),
      })
        .then(function (response) {
          if (response.status === 403) {
            return response.json().then(function (data) {
              throw new Error(
                "Origin not allowed. Please add this domain to your API key settings.",
              );
            });
          }
          if (response.status === 401) {
            throw new Error("Invalid API key");
          }
          if (response.ok) {
            resolve();
            return;
          }
          throw new Error("Validation failed");
        })
        .catch(function (error) {
          if (
            error.message.includes("Origin") ||
            error.message.includes("API key")
          ) {
            reject(error);
          } else {
            resolve();
          }
        });
    });
  };

  /**
   * Check incognito feature
   */
  CrazzyPe.prototype._checkIncognitoFeature = function () {
    var self = this;

    return new Promise(function (resolve) {
      fetch(apiOrdersUrl("/api/orders/check-incognito-feature"), {
        method: "GET",
        headers: apiAuthHeaders(self.options.key),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          resolve(data.status === "success" && data.hasIncognito);
        })
        .catch(function () {
          resolve(false);
        });
    });
  };

  /**
   * Create order
   */
  CrazzyPe.prototype._createOrder = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      var orderId =
        self.options.order_id ||
        "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      var requestStartedAt = performance.now();
      var session = self._session;
      fetch(apiOrdersUrl("/api/orders/create-order"), {
        method: "POST",
        headers: apiAuthHeaders(self.options.key),
        body: JSON.stringify({
          txn_id: orderId,
          amount: self._normalizeAmountRupees(self.options.amount).toString(),
          p_info: self.options.description,
          customer_name: self.options.prefill.name || "Customer",
          customer_email: self.options.prefill.email || "",
          customer_mobile: self.options.prefill.contact || "",
          redirect_url: self.options.callback_url || window.location.href,
          udf1: (self.options.notes && self.options.notes.udf1) || "",
          udf2: (self.options.notes && self.options.notes.udf2) || "",
          udf3: (self.options.notes && self.options.notes.udf3) || "",
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (self._session !== session || !self.overlay) return resolve(null);
          if (data.status === "success") {
            self.options.order_id = data.order_id || orderId;
            self._anchorQrDeadline(data.qr_timeout_seconds, performance.now() - requestStartedAt);
            resolve(data);
          } else {
            reject(new Error(data.message || "Order creation failed"));
          }
        })
        .catch(reject);
    });
  };

  /**
   * Handle success — Frames 3–6, then fire legacy handlers after the 5s countdown.
   * Auto-redirect ONLY when merchant explicitly set callback_url.
   */
  CrazzyPe.prototype._handleSuccess = function (data) {
    data = data || {};
    var explicitCallback = this.options.callback_url || "";
    var redirectUrl = explicitCallback
      ? data.redirect_url || explicitCallback
      : "";
    this._beginProcessingFlow(
      Object.assign({}, data, { redirect_url: redirectUrl || explicitCallback }),
    );
  };

  /**
   * Handle failure
   */
  CrazzyPe.prototype._handleFailure = function (data) {
    data = data || {};
    this._showFailureSheet({
      title: "Payment Failed",
      message: data.error_description || "Something went wrong",
      payment_id: data.payment_id || data.upi_txn_id || "",
      utr: data.utr || data.UTR || "",
      code: data.error_code || "PAYMENT_FAILED",
    });

    if (this.options.onFailure) {
      this.options.onFailure({
        error: {
          code: data.error_code || "PAYMENT_FAILED",
          description: data.error_description || "Payment failed",
          source: "customer",
          step: "payment",
          reason: data.reason || "unknown",
        },
      });
    }
  };

  /**
   * Show error
   */
  CrazzyPe.prototype._showError = function (message) {
    this._showStartupError({ message: "The payment could not be started", retryable: !this._merchantOrderId });
  };

  /**
   * Close the modal
   */
  CrazzyPe.prototype.close = function () {
    this._session++;
    if (this._closeLightbox) this._closeLightbox();
    this._closeMenu = null;
    this._pollNow = null;
    this._onVisibilityResync = null;
    if (this._onVisibilityChange) document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this._onVisibilityChange = null;
    this._visibilityBound = false;
    this._selectedMobileIntent = "";
    this._mobileContinue = null;
    if (this._onOffline) window.removeEventListener("offline", this._onOffline);
    if (this._onOnline) window.removeEventListener("online", this._onOnline);
    this._onOffline = null;
    this._onOnline = null;
    this._clearSheetTimers();
    this._unbindA11y();
    this._onQrExpired = null;
    this._pendingSuccess = null;
    this._pendingSheetShown = false;
    this._activeSheet = null;
    this.checkoutRoot = null;
    this.sheetHost = null;
    this.stageEl = null;
    this.loaderEl = null;
    this.checkoutMount = null;
    this.modalEl = null;
    this.ariaLive = null;
    this._shellReady = false;

    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.utrPromptTimeout) {
      clearTimeout(this.utrPromptTimeout);
      this.utrPromptTimeout = null;
    }
    this.utrPromptShown = false;
    this._closeUtrModal();

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    document.body.style.overflow = "";

    var prev = this._previousActiveElement;
    this._previousActiveElement = null;
    if (prev && typeof prev.focus === "function") {
      try {
        prev.focus();
      } catch (e) {
        /* ignore */
      }
    }

    if (this.options.onDismiss) {
      this.options.onDismiss();
    }

    if (this.options.modal && this.options.modal.ondismiss) {
      this.options.modal.ondismiss();
    }
  };

  /**
   * Normalize amount to whole rupees (no paise)
   */
  CrazzyPe.prototype._normalizeAmountRupees = function (amount) {
    var num = parseFloat(amount);
    if (isNaN(num)) return 0;
    return Math.round(num);
  };

  /**
   * Format amount for display (INR via Intl — avoids mojibake from raw rupee bytes)
   */
  CrazzyPe.prototype._formatAmount = function (amount) {
    var num = parseFloat(amount);
    if (isNaN(num)) num = 0;
    var currency = (this.options && this.options.currency) || "INR";
    var fraction = Math.abs(num % 1) > 0.0001 ? 2 : 0;
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      }).format(num);
    } catch (err) {
      return "\u20B9" + num.toLocaleString("en-IN", {
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      });
    }
  };

  // Export to global scope — keep legacy aliases so old merchant snippets keep working
  CrazzyPe.VERSION = CHECKOUT_VERSION;
  CrazzyPe.version = CHECKOUT_VERSION;

  if (typeof window !== "undefined") {
    window.CrazzyPe = CrazzyPe;
    window.Crazzype = window.Crazzype || CrazzyPe;
    window.CutePe = window.CutePe || CrazzyPe;
    window.crazzype = window.crazzype || CrazzyPe;
    window.CRAZZYPE_CHECKOUT_VERSION = CHECKOUT_VERSION;
  }
})();
