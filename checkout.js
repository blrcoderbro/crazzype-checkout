/**
 * CrazzyPe Checkout.js
 * ---------------------------------------------------------------------------
 * Versioning (cache-busting):
 *   Latest (short cache):  https://crazzype.com/checkout.js
   *   Pinned (immutable):    https://crazzype.com/v/4.1.0/checkout.js
 * Bump CHECKOUT_VERSION below, then run: npm run tag:checkout
 * ---------------------------------------------------------------------------
 */

(function () {
  "use strict";

  /** @type {string} Semver — bump this when shipping checkout UI/API changes */
  var CHECKOUT_VERSION = "4.1.1";

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
    foreground: "#292f32",
    muted: "#6c849d",
    mutedLight: "#afb6bb",
    border: "#dee1e3",
    borderLight: "#eef0f3",
    surface: "#f7f7f7",
    surfaceActive: "#f0f6ff",
    success: "#009e5c",
    error: "#e51a45",
    warning: "#f59e0b",
    gradient: "#3395ff",
  };

  var BAGS_SVG =
    '<svg viewBox="0 0 220 140" width="200" height="120" fill="none" aria-hidden="true">' +
    '<ellipse cx="110" cy="128" rx="78" ry="10" fill="rgba(0,0,0,0.16)"/>' +
    '<path d="M78 52 L118 46 L130 118 L70 124 Z" fill="#ffffff" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>' +
    '<path d="M78 52 L118 46 L124 72 L74 78 Z" fill="#f1f5f9"/>' +
    '<path d="M90 50 C90 34 108 34 108 48" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M120 62 L162 55 L178 118 L118 124 Z" fill="#34d399" stroke="#059669" stroke-width="1"/>' +
    '<path d="M132 60 C132 44 152 44 152 58" stroke="#047857" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="144" cy="86" r="12" fill="#6ee7b7"/>' +
    '<text x="144" y="91" font-size="11" font-weight="800" fill="#064e3b" text-anchor="middle">%</text>' +
    '<path d="M42 88 L78 82 L90 122 L38 126 Z" fill="#60a5fa"/>' +
    '<path d="M38 88 L78 82 L78 94 L36 98 Z" fill="#93c5fd"/>' +
    '<rect x="58" y="84" width="6" height="40" fill="#ffffff"/>' +
    "</svg>";

  var SHIELD_SVG =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="#10b981"/>' +
    '<path d="M8.5 12l2.5 2.5 5-5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  // Embedded Styles
  var STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .cpz-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 32, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 16px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      animation: cpz-fade-in 0.3s ease-out;
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
        transform: scale(0.95) translateY(10px); 
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
      width: 100%;
      max-width: 920px;
      height: 580px;
      max-height: 92vh;
      background: ${THEME.background};
      border-radius: 12px;
      box-shadow: 0 24px 64px rgba(41, 47, 50, 0.28);
      overflow: hidden;
      position: relative;
      animation: cpz-scale-in 0.3s ease-out;
      display: flex;
      flex-direction: column;
    }

    .cpz-modal::before { display: none; }

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

    /* ===== Razorpay Standard Checkout shell ===== */
    .cpz-rzp-shell {
      display: flex;
      flex-direction: row;
      height: 100%;
      min-height: 0;
      flex: 1;
    }

    .cpz-rzp-sidebar {
      width: 280px;
      min-width: 280px;
      background: ${THEME.primary};
      color: #fff;
      padding: 22px 18px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .cpz-rzp-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }

    .cpz-rzp-brand .cpz-logo,
    .cpz-rzp-brand .cpz-logo-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fff;
      color: ${THEME.primary};
      object-fit: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .cpz-rzp-name {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }

    .cpz-rzp-trust {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 3px;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.92);
    }

    .cpz-rzp-trust svg { width: 13px; height: 13px; flex-shrink: 0; }

    .cpz-rzp-price-card {
      background: #fff;
      border-radius: 10px;
      padding: 14px 16px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
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
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #0f172a;
    }

    .cpz-rzp-user-row {
      margin-top: 12px;
      background: rgba(255,255,255,0.16);
      border-radius: 10px;
      padding: 11px 12px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .cpz-rzp-user-row-left {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      min-width: 0;
    }

    .cpz-rzp-user-row-left > svg {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .cpz-rzp-user-meta {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cpz-rzp-user-meta strong {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cpz-rzp-user-meta span {
      display: block;
      font-size: 11px;
      font-weight: 500;
      opacity: 0.88;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      gap: 8px;
      align-items: stretch;
    }

    .cpz-rzp-bags {
      display: flex;
      justify-content: center;
      opacity: 0.95;
      pointer-events: none;
    }

    .cpz-rzp-secured {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.88);
    }

    .cpz-rzp-secured svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .cpz-rzp-footer-amount span {
      display: block;
      font-size: 10px;
      color: ${THEME.muted};
    }

    .cpz-rzp-footer-amount strong {
      color: ${THEME.foreground};
      font-size: 16px;
    }

    .cpz-rzp-workspace {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
    }

    .cpz-rzp-topbar {
      height: 52px;
      border-bottom: 1px solid ${THEME.borderLight};
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      padding: 0 48px 0 20px;
    }

    .cpz-rzp-topbar-title {
      font-size: 15px;
      font-weight: 600;
      color: ${THEME.foreground};
      letter-spacing: -0.01em;
    }

    .cpz-rzp-body {
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: hidden;
    }

    .cpz-rzp-methods {
      width: 250px;
      min-width: 250px;
      border-right: 1px solid ${THEME.borderLight};
      padding: 8px 0;
      overflow-y: auto;
      background: #fff;
    }

    .cpz-rzp-method {
      width: 100%;
      border: none;
      border-radius: 0;
      background: transparent;
      padding: 14px 16px;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      color: ${THEME.foreground};
      position: relative;
    }

    .cpz-rzp-method::after {
      content: '';
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 0;
      height: 1px;
      background: ${THEME.borderLight};
    }

    .cpz-rzp-method:hover { background: #f8fafc; }
    .cpz-rzp-method.is-active {
      background: #f3f0ff;
    }
    .cpz-rzp-method.is-active .cpz-rzp-method-title {
      color: #292f32;
      font-weight: 600;
    }

    .cpz-rzp-method-copy { flex: 1; min-width: 0; }
    .cpz-rzp-method-title { display: block; font-size: 13.5px; font-weight: 600; }
    .cpz-rzp-method-sub { display: block; margin-top: 2px; font-size: 11px; color: ${THEME.muted}; }

    .cpz-rzp-method-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .cpz-rzp-method-icons img {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid ${THEME.borderLight};
      background: #fff;
    }

    .cpz-rzp-panel {
      flex: 1;
      min-width: 0;
      padding: 18px 22px;
      overflow-y: auto;
      background: #fff;
    }

    .cpz-rzp-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .cpz-rzp-panel-head h2 {
      font-size: 15px;
      font-weight: 600;
      color: ${THEME.foreground};
      margin: 0;
    }

    .cpz-rzp-timer {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: ${THEME.foreground};
      background: #f7f9fc;
      border: 1px solid #e8ebef;
      border-radius: 999px;
      padding: 5px 10px 5px 8px;
      letter-spacing: 0.01em;
      font-variant-numeric: tabular-nums;
    }

    .cpz-rzp-timer.is-visible { display: inline-flex; }

    .cpz-rzp-timer svg {
      width: 12px;
      height: 12px;
      color: ${THEME.primary};
      flex-shrink: 0;
    }

    .cpz-rzp-scan {
      border: none;
      border-radius: 0;
      padding: 12px 0 0;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      min-height: 280px;
      justify-content: center;
    }

    .cpz-rzp-qr-slot {
      width: 184px;
      height: 184px;
      border: none;
      border-radius: 8px;
      background: transparent;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .cpz-rzp-qr-slot.is-live {
      background: #fff;
      border: 1px solid #e8ebef;
      padding: 10px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .cpz-rzp-qr-slot .cpz-qr-section {
      margin: 0;
      width: 100%;
      height: 100%;
    }

    .cpz-rzp-qr-slot .cpz-qr-container {
      width: 100%;
      height: 100%;
      box-shadow: none;
      border: none;
      padding: 0;
      border-radius: 0;
      background: transparent;
    }

    .cpz-rzp-qr-slot .cpz-qr-image,
    .cpz-rzp-qr-slot .cpz-qr-loading {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: transparent;
    }

    .cpz-rzp-qr-slot .cpz-spinner {
      border-color: #e8ebef;
      border-top-color: #94a3b8;
    }

    .cpz-rzp-qr-prompt {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      max-width: 260px;
      line-height: 1.45;
    }

    .cpz-rzp-app-row {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cpz-rzp-app-row img {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid ${THEME.border};
      background: #fff;
    }

    .cpz-rzp-generate-pill {
      appearance: none;
      border: 1px solid ${THEME.primary};
      background: #fff;
      color: ${THEME.primary};
      border-radius: 999px;
      padding: 10px 28px;
      font: 600 13px Inter, sans-serif;
      cursor: pointer;
      letter-spacing: 0.01em;
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
    }

    .cpz-rzp-generate-pill:hover {
      background: ${THEME.primary};
      color: #fff;
    }

    .cpz-rzp-generate-pill:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    .cpz-rzp-pay-btn {
      margin-top: 4px;
      width: 100%;
      max-width: 280px;
      border: 0;
      border-radius: 4px;
      padding: 12px 20px;
      background: ${THEME.primary};
      color: #fff;
      font: 600 14px Inter, sans-serif;
      cursor: pointer;
    }

    .cpz-rzp-pay-btn:hover { background: ${THEME.primaryDark}; }

    .cpz-rzp-pay-btn[hidden],
    .cpz-rzp-generate-pill[hidden] {
      display: none !important;
    }

    .cpz-rzp-mob-header {
      display: none;
      background: ${THEME.primary};
      color: #fff;
      padding: 14px 16px;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .cpz-rzp-mob-header .cpz-logo,
    .cpz-rzp-mob-header .cpz-logo-placeholder {
      width: 36px; height: 36px; border-radius: 6px; background: #fff; color: ${THEME.primary};
      display: flex; align-items: center; justify-content: center; font-weight: 700; object-fit: cover;
    }

    .cpz-rzp-mob-amount {
      margin-left: auto;
      text-align: right;
      flex-shrink: 0;
    }

    .cpz-rzp-mob-amount span { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.04em; opacity:.75; }
    .cpz-rzp-mob-amount strong { display:block; font-size:16px; font-weight:700; }

    .cpz-rzp-mob-footer {
      display: none;
      border-top: 1px solid ${THEME.border};
      padding: 10px 16px 16px;
      background: #fff;
      flex-shrink: 0;
    }

    .cpz-rzp-mob-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    @media (max-width: 767px) {
      .cpz-rzp-shell { flex-direction: column; }
      .cpz-rzp-sidebar { display: none; }
      .cpz-rzp-mob-header { display: flex; }
      .cpz-rzp-topbar { display: none; }
      .cpz-rzp-body { flex-direction: column; overflow-y: auto; }
      .cpz-rzp-methods { width: 100%; min-width: 0; border-right: 0; border-bottom: 1px solid ${THEME.borderLight}; padding: 8px 0; }
      .cpz-rzp-panel { padding: 16px; }
      .cpz-rzp-mob-footer { display: block; }
      .cpz-close { color: #fff; top: 14px; right: 14px; }
      .cpz-close:hover { background: rgba(255,255,255,0.18); color: #fff; }
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
      name: "BHIM UPI",
      logo: "https://play-lh.googleusercontent.com/B5cNBA15IxjCT-8UTXEWgiPcGkJ1C07iHKwm2Hbs8xR3PnJvZ0swTag3abdC_Fj5OfnP=w240-h480-rw",
    },
    {
      name: "Paytm",
      logo: "https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=w240-h480-rw",
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
    };

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

    // Reset per-open state so reusing an instance (legacy pattern) still works
    this._qrActivated = false;
    this.utrPromptShown = false;
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
    this._renderModal("loading");

    this._validateOrigin()
      .then(function () {
        return self._checkIncognitoFeature();
      })
      .then(function (hasFeature) {
        if (!hasFeature) {
          self._showError(
            "Incognito checkout is a premium feature. Please upgrade your plan or verify your API key.",
          );
          return Promise.reject(new Error("Feature not available"));
        }
        return self._createOrder();
      })
      .then(function (data) {
        if (data && data.status === "success") {
          self.orderDetails = data;
          self.qrTimeoutSeconds =
            Number(data.qr_timeout_seconds) ||
            (String(data.merchantId || "").toLowerCase() === "bharatpe"
              ? 20
              : String(data.merchantId || "").toLowerCase() === "quintuspay"
                ? 30
                : 300);
          self._renderModal("methods", data);
        } else if (data) {
          self._showError(data.message || "Failed to initialize payment");
        }
      })
      .catch(function (error) {
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
   * Render the modal with different states
   */
  CrazzyPe.prototype._renderModal = function (state, data) {
    var self = this;

    // Remove existing overlay
    if (this.overlay) {
      this.overlay.remove();
    }

    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "cpz-overlay";
    this.overlay.onclick = function (e) {
      if (
        e.target === self.overlay &&
        self.options.modal.backdropclose !== false
      ) {
        self.close();
      }
    };

    // Create modal
    var modal = document.createElement("div");
    modal.className = "cpz-modal";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "cpz-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = function () {
      self.close();
    };
    modal.appendChild(closeBtn);

    // Content container
    var content = document.createElement("div");
    content.className = "cpz-content";

    switch (state) {
      case "loading":
        content.appendChild(this._createLoadingState());
        break;
      case "methods":
      case "payment":
        content.appendChild(this._createRazorpayCheckout(data));
        break;
      case "processing":
        content.appendChild(this._createProcessingState());
        break;
      case "success":
        content.appendChild(this._createSuccessState(data));
        break;
      case "error":
        content.appendChild(this._createErrorState(data));
        break;
    }

    modal.appendChild(content);
    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  };

  CrazzyPe.prototype._createRazorpayCheckout = function (data) {
    var self = this;
    var amountStr = this._formatAmount(this.options.amount);
    var primary =
      (this.options.theme && (this.options.theme.color || this.options.theme.primary)) ||
      THEME.primary;
    var customer = this._getCustomerDetails(data);

    var root = document.createElement("div");
    root.className = "cpz-rzp-shell";

    // ---- Desktop left sidebar ----
    var sidebar = document.createElement("aside");
    sidebar.className = "cpz-rzp-sidebar";
    sidebar.style.background = primary;

    var brand = document.createElement("div");
    brand.className = "cpz-rzp-brand";
    if (this.options.image) {
      var logo = document.createElement("img");
      logo.className = "cpz-logo";
      logo.src = this.options.image;
      logo.alt = this.options.name;
      brand.appendChild(logo);
    } else {
      var ph = document.createElement("div");
      ph.className = "cpz-logo-placeholder";
      ph.style.color = primary;
      ph.textContent = (this.options.name || "C").charAt(0).toUpperCase();
      brand.appendChild(ph);
    }
    var brandInfo = document.createElement("div");
    brandInfo.innerHTML =
      '<div class="cpz-rzp-name"></div>' +
      '<div class="cpz-rzp-trust">' + SHIELD_SVG + "<span>CrazzyPe Trusted Business</span></div>";
    brandInfo.querySelector(".cpz-rzp-name").textContent = this.options.name || "CrazzyPe";
    brand.appendChild(brandInfo);

    var priceCard = document.createElement("div");
    priceCard.className = "cpz-rzp-price-card";
    priceCard.innerHTML =
      "<span>Price Summary</span><strong>\u20B9" + amountStr + "</strong>";

    var userRow = document.createElement("div");
    userRow.className = "cpz-rzp-user-row";
    userRow.appendChild(this._createCustomerRowContent(customer));

    var sideTop = document.createElement("div");
    sideTop.appendChild(brand);
    sideTop.appendChild(priceCard);
    sideTop.appendChild(userRow);

    var sideBottom = document.createElement("div");
    sideBottom.className = "cpz-rzp-sidebar-bottom";
    sideBottom.innerHTML =
      '<div class="cpz-rzp-bags">' + BAGS_SVG + "</div>" +
      '<div class="cpz-rzp-secured">' + ICONS.lock + "<span>Secured by CrazzyPe</span></div>";

    sidebar.appendChild(sideTop);
    sidebar.appendChild(sideBottom);

    // ---- Mobile header ----
    var mobHeader = document.createElement("div");
    mobHeader.className = "cpz-rzp-mob-header";
    mobHeader.style.background = primary;
    var mobBrand = document.createElement("div");
    mobBrand.className = "cpz-rzp-brand";
    if (this.options.image) {
      var mLogo = document.createElement("img");
      mLogo.className = "cpz-logo";
      mLogo.src = this.options.image;
      mLogo.alt = this.options.name;
      mobBrand.appendChild(mLogo);
    } else {
      var mPh = document.createElement("div");
      mPh.className = "cpz-logo-placeholder";
      mPh.style.color = primary;
      mPh.textContent = (this.options.name || "C").charAt(0).toUpperCase();
      mobBrand.appendChild(mPh);
    }
    var mobInfo = document.createElement("div");
    mobInfo.innerHTML =
      '<div class="cpz-rzp-name"></div>' +
      '<div class="cpz-rzp-trust">' + SHIELD_SVG + "<span>Verified Business</span></div>";
    mobInfo.querySelector(".cpz-rzp-name").textContent = this.options.name || "CrazzyPe";
    mobBrand.appendChild(mobInfo);
    var mobAmount = document.createElement("div");
    mobAmount.className = "cpz-rzp-mob-amount";
    mobAmount.innerHTML = "<span>Total</span><strong>\u20B9" + amountStr + "</strong>";
    mobHeader.appendChild(mobBrand);
    mobHeader.appendChild(mobAmount);

    // ---- Right workspace ----
    var workspace = document.createElement("div");
    workspace.className = "cpz-rzp-workspace";

    var topbar = document.createElement("div");
    topbar.className = "cpz-rzp-topbar";
    topbar.innerHTML = '<div class="cpz-rzp-topbar-title">Payment Options</div>';

    var body = document.createElement("div");
    body.className = "cpz-rzp-body";

    var methods = document.createElement("aside");
    methods.className = "cpz-rzp-methods";

    var methodIcons = UPI_APPS.slice(0, 3)
      .map(function (app) {
        return '<img src="' + app.logo + '" alt="' + app.name + '" />';
      })
      .join("");

    var method = document.createElement("button");
    method.type = "button";
    method.className = "cpz-rzp-method is-active";
    method.innerHTML =
      '<span class="cpz-rzp-method-copy">' +
      '<span class="cpz-rzp-method-title">UPI</span>' +
      '<span class="cpz-rzp-method-sub">Pay by any UPI app</span></span>' +
      '<span class="cpz-rzp-method-icons">' + methodIcons + "</span>";
    methods.appendChild(method);

    var panel = document.createElement("main");
    panel.className = "cpz-rzp-panel";

    var panelHead = document.createElement("div");
    panelHead.className = "cpz-rzp-panel-head";
    panelHead.innerHTML = "<h2>Scan QR using any UPI app</h2>";
    var timerEl = document.createElement("div");
    timerEl.className = "cpz-rzp-timer";
    timerEl.id = "cpz-rzp-timer-label";
    timerEl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<span id="cpz-rzp-timer-text">05:00</span>';
    panelHead.appendChild(timerEl);

    var scan = document.createElement("div");
    scan.className = "cpz-rzp-scan";
    var qrSlot = document.createElement("div");
    qrSlot.className = "cpz-rzp-qr-slot";
    qrSlot.innerHTML =
      '<div class="cpz-rzp-qr-prompt" style="padding:24px 12px">Tap Generate to create a live QR</div>';

    var prompt = document.createElement("div");
    prompt.className = "cpz-rzp-qr-prompt";
    prompt.textContent = "Pay using any UPI app. Your QR is generated securely on demand.";

    var appRow = document.createElement("div");
    appRow.className = "cpz-rzp-app-row";
    UPI_APPS.forEach(function (app) {
      var img = document.createElement("img");
      img.src = app.logo;
      img.alt = app.name;
      img.title = app.name;
      appRow.appendChild(img);
    });

    var generateBtn = document.createElement("button");
    generateBtn.type = "button";
    generateBtn.className = "cpz-rzp-generate-pill";
    generateBtn.style.borderColor = primary;
    generateBtn.style.color = primary;
    generateBtn.textContent = "Generate";

    var payBtn = document.createElement("button");
    payBtn.type = "button";
    payBtn.className = "cpz-rzp-pay-btn";
    payBtn.style.background = primary;
    payBtn.textContent = "Pay \u20B9" + amountStr;
    payBtn.hidden = true;

    scan.appendChild(qrSlot);
    scan.appendChild(prompt);
    scan.appendChild(appRow);
    scan.appendChild(generateBtn);
    scan.appendChild(payBtn);
    panel.appendChild(panelHead);
    panel.appendChild(scan);

    body.appendChild(methods);
    body.appendChild(panel);
    workspace.appendChild(topbar);
    workspace.appendChild(body);

    // ---- Mobile sticky footer ----
    var mobFooter = document.createElement("div");
    mobFooter.className = "cpz-rzp-mob-footer";
    var mobFooterRow = document.createElement("div");
    mobFooterRow.className = "cpz-rzp-mob-footer-row";
    mobFooterRow.innerHTML =
      '<div class="cpz-rzp-footer-amount"><span>Total</span><strong>\u20B9' +
      amountStr +
      "</strong></div>";
    var mobContinue = document.createElement("button");
    mobContinue.type = "button";
    mobContinue.className = "cpz-rzp-pay-btn";
    mobContinue.style.cssText =
      "margin:0;max-width:none;min-width:140px;background:" + primary;
    mobContinue.textContent = "Generate";
    mobFooterRow.appendChild(mobContinue);
    mobFooter.appendChild(mobFooterRow);

    function generateQr() {
      if (self._qrActivated) return;
      generateBtn.disabled = true;
      generateBtn.textContent = "Generating…";
      mobContinue.disabled = true;
      qrSlot.innerHTML = '<div class="cpz-qr-loading"><div class="cpz-spinner"></div></div>';
      qrSlot.classList.add("is-live");
      prompt.textContent = "Scan with any UPI app to pay";
      timerEl.classList.add("is-visible");
      // Slim Razorpay-style pill only — never inject the bulky circular timer card
      self._ensureQr(data, qrSlot, {
        skipTimerUi: true,
        extrasHost: scan,
        beforeNode: prompt,
      });
      generateBtn.hidden = true;
      payBtn.hidden = false;
      mobContinue.disabled = false;
      mobContinue.textContent = "Pay \u20B9" + amountStr;
    }

    function onPayOrGenerate() {
      if (!self._qrActivated) {
        generateQr();
        return;
      }
      var uri = self._pickFirstNonPaytmUri([
        data.generic_upi_intent,
        data.upi_link,
        data.upi_intent,
      ]);
      if (uri) window.location.href = uri;
    }

    method.onclick = function () {
      method.classList.add("is-active");
    };
    generateBtn.onclick = generateQr;
    payBtn.onclick = onPayOrGenerate;
    mobContinue.onclick = onPayOrGenerate;

    root.appendChild(sidebar);
    root.appendChild(mobHeader);
    root.appendChild(workspace);
    root.appendChild(mobFooter);
    return root;
  };

  CrazzyPe.prototype._ensureQr = function (data, slot, opts) {
    if (this._qrActivated) return;
    this._qrActivated = true;
    data._qrStartedAt = Date.now();
    opts = opts || {};
    slot.innerHTML = "";
    var qrData = Object.assign({}, data);
    if (data.payment_url) {
      try {
        var token = new URL(data.payment_url, window.location.href).pathname.split("/").filter(Boolean).pop();
        if (token) qrData.qr_code_url = apiOrdersUrl("/api/orders/checkout-qr/" + encodeURIComponent(token));
      } catch (e) {
        /* retain create-order QR fallback for legacy/custom payment URLs */
      }
    }
    slot.appendChild(this._createQRSection(qrData));

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

    // SDK-created orders expose payment_url; derive its token and materialize
    // the QR only when Scan & Pay is opened.
    var qrData = null;
    if (data && data.payment_url) {
      var token = String(data.payment_url).split("/pay/")[1];
      if (token) {
        qrData = apiOrdersUrl("/api/orders/checkout-qr/" + encodeURIComponent(token.split(/[?#]/)[0]));
      }
    }

    // Priority: qr_code_url > upi_link > upi_intent > construct from upiId
    if (!qrData && data && data.qr_code_url) {
      qrData = data.qr_code_url;
    } else if (data && data.upi_link) {
      qrData =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(data.upi_link);
    } else if (data && data.upi_intent) {
      qrData =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(data.upi_intent);
    } else if (data && data.upiId) {
      // Reference format: pay?pa=&pn=&am=&tr=&mc=9223&orgid=000000&mode=01&cu=INR&tn=, strip spaces, encodeURI
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
      var upiLink = "upi://" + encodeURI(query.replace(/\s/g, ""));
      qrData =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(upiLink);
    }

    if (qrData) {
      var img = document.createElement("img");
      img.className = "cpz-qr-image";
      // Check if qrData is already a full URL or needs to be used with qrserver
      if (qrData.startsWith("http")) {
        img.src = qrData;
      } else {
        img.src =
          "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
          encodeURIComponent(qrData);
      }
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
      if (value && !self._isPaytmUri(value) && !/^intent:\/\//i.test(value))
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

  CrazzyPe.prototype._createCustomerRowContent = function (customer) {
    var wrap = document.createElement("div");
    wrap.className = "cpz-rzp-user-row-left";
    wrap.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    var meta = document.createElement("div");
    meta.className = "cpz-rzp-user-meta";

    var nameEl = document.createElement("strong");
    nameEl.textContent = customer.name || "Guest User";
    meta.appendChild(nameEl);

    if (customer.phone) {
      var phoneEl = document.createElement("span");
      phoneEl.textContent = customer.phone;
      meta.appendChild(phoneEl);
    }
    if (customer.email) {
      var emailEl = document.createElement("span");
      emailEl.textContent = customer.email;
      meta.appendChild(emailEl);
    }
    if (!customer.phone && !customer.email) {
      var guestEl = document.createElement("span");
      guestEl.textContent = "Paying as guest";
      meta.appendChild(guestEl);
    }

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

  /**
   * Create processing state
   */
  CrazzyPe.prototype._createProcessingState = function () {
    var container = document.createElement("div");
    container.className = "cpz-status cpz-coin-status";
    container.innerHTML =
      this._createCoinMarkup() +
      '<div class="cpz-status-title">Verifying Your Payment</div>' +
      '<div class="cpz-status-message">Bank verification in progress. Please do not close this window.</div>';
    return container;
  };

  /**
   * Create success state — 3D coin until redirect / dismiss
   */
  CrazzyPe.prototype._createSuccessState = function (data) {
    var container = document.createElement("div");
    container.className = "cpz-status cpz-coin-status";
    var redirecting = !!(data && (data.redirect_url || this.options.callback_url));
    container.innerHTML =
      this._createCoinMarkup() +
      '<div class="cpz-status-title">Payment Successful!</div>' +
      '<div class="cpz-status-message">' +
      (redirecting
        ? "Redirecting you back to the merchant..."
        : "Your payment has been processed successfully.") +
      "</div>";
    return container;
  };

  /**
   * Create error state
   */
  CrazzyPe.prototype._createErrorState = function (data) {
    var self = this;
    var container = document.createElement("div");
    container.className = "cpz-status";

    var icon = document.createElement("div");
    icon.className = "cpz-status-icon error";
    icon.innerHTML = ICONS.x;
    container.appendChild(icon);

    var title = document.createElement("div");
    title.className = "cpz-status-title";
    title.textContent = data && data.title ? data.title : "Payment Failed";
    container.appendChild(title);

    var message = document.createElement("div");
    message.className = "cpz-status-message";
    message.textContent =
      data && data.message
        ? data.message
        : "Something went wrong. Please try again.";
    container.appendChild(message);

    var button = document.createElement("button");
    button.className = "cpz-status-button secondary";
    button.textContent = "Close";
    button.onclick = function () {
      self.close();
    };
    container.appendChild(button);

    return container;
  };

  /**
   * Start payment timer
   */
  CrazzyPe.prototype._startTimer = function () {
    var self = this;
    this.timeLeft = this.qrTimeoutSeconds;

    this.paymentTimer = setInterval(function () {
      self.timeLeft--;

      if (self.timeLeft <= 0) {
        clearInterval(self.paymentTimer);
        clearInterval(self.pollingInterval);
        self._handleFailure({ error_description: "Payment timeout" });
        return;
      }

      var minutes = Math.floor(self.timeLeft / 60);
      var seconds = self.timeLeft % 60;
      var formatted =
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds;

      // Update timer text (legacy circle + Razorpay slim pill)
      var timerText = document.getElementById("cpz-timer-text");
      if (timerText) timerText.textContent = formatted;
      var slimTimer = document.getElementById("cpz-rzp-timer-text");
      if (slimTimer) slimTimer.textContent = formatted;

      // Update progress circle
      var progress = document.getElementById("cpz-timer-progress");
      if (progress) {
        var offset = self.timerCircumference * (1 - self.timeLeft / self.qrTimeoutSeconds);
        progress.setAttribute("stroke-dashoffset", offset);

        // Change color based on time
        progress.classList.remove("warning", "danger");
        if (self.timeLeft <= 60) {
          progress.classList.add("danger");
        } else if (self.timeLeft <= 120) {
          progress.classList.add("warning");
        }
      }
    }, 1000);
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

    this.pollingInterval = setInterval(function () {
      if (Date.now() - self.orderDetails._qrStartedAt >= self.qrTimeoutSeconds * 1000) {
        clearInterval(self.pollingInterval);
        clearInterval(self.paymentTimer);
        self._handleFailure({ error_description: "QR payment session expired" });
        return;
      }
      fetch(apiOrdersUrl("/api/orders/check-order-status"), {
        method: "POST",
        headers: apiAuthHeaders(self.options.key),
        body: JSON.stringify({ order_id: orderId }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.status === "success" && data.txn_status === "TXN_SUCCESS") {
            clearInterval(self.pollingInterval);
            clearInterval(self.paymentTimer);

            self._renderModal("processing");

            setTimeout(function () {
              var hash = "";
              var redirectUrl =
                (data.data && data.data.redirect_url) ||
                self.options.callback_url ||
                "";
              if (redirectUrl) {
                var hashMatch = redirectUrl.match(/hash=([^&]+)/);
                if (hashMatch) hash = decodeURIComponent(hashMatch[1]);
              }

              self._handleSuccess({
                order_id: orderId,
                payment_id: data.data && data.data.upi_txn_id,
                signature: hash,
                hash: hash,
                redirect_url: redirectUrl,
              });
            }, 1200);
          } else if (
            data.txn_status === "TXN_FAILED" ||
            data.txn_status === "TXN_ALREADY_PROCESSED" ||
            data.txn_status === "AMOUNT_TAMPERED"
          ) {
            clearInterval(self.pollingInterval);
            clearInterval(self.paymentTimer);
            self._handleFailure({
              error_description: data.message || "Payment could not be completed",
            });
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
          console.error("CrazzyPe: Status check error", error);
        });
    }, 2000);
  };

  CrazzyPe.prototype._promptBharatPeUtr = function (orderId) {
    var self = this;
    var resolvedOrderId =
      orderId ||
      this.options.order_id ||
      (this.orderDetails && this.orderDetails.order_id);
    if (!resolvedOrderId) return;

    self._openUtrModal().then(function (normalizedUtr) {
      if (!normalizedUtr) return;
      self._verifyBharatPeUtr(resolvedOrderId, normalizedUtr);
    });
  };

  CrazzyPe.prototype._verifyBharatPeUtr = function (orderId, normalizedUtr) {
    var self = this;

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
        if (data.status === "success" && data.txn_status === "TXN_SUCCESS") {
          self._closeUtrModal();
          clearInterval(self.paymentTimer);
          self._renderModal("processing");
          setTimeout(function () {
            var hash = "";
            var redirectUrl =
              (data.data && data.data.redirect_url) ||
              self.options.callback_url ||
              "";
            if (redirectUrl) {
              var hashMatch = redirectUrl.match(/hash=([^&]+)/);
              if (hashMatch) hash = decodeURIComponent(hashMatch[1]);
            }
            self._handleSuccess({
              order_id: orderId,
              payment_id: data.data && data.data.upi_txn_id,
              signature: hash,
              hash: hash,
              redirect_url: redirectUrl,
            });
          }, 1200);
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
            if (retryUtr) self._verifyBharatPeUtr(orderId, retryUtr);
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
          if (retryUtr) self._verifyBharatPeUtr(orderId, retryUtr);
        });
      })
      .catch(function () {
        self._openUtrModal({
          errorMessage: "Unable to verify payment right now. Please try again.",
        }).then(function (retryUtr) {
          if (retryUtr) self._verifyBharatPeUtr(orderId, retryUtr);
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
          if (data.status === "success") {
            self.options.order_id = data.order_id || orderId;
            resolve(data);
          } else {
            reject(new Error(data.message || "Order creation failed"));
          }
        })
        .catch(reject);
    });
  };

  /**
   * Handle success — show 3D coin, then fire legacy handlers.
   * Auto-redirect ONLY when merchant explicitly set callback_url
   * (do not use create-order's window.location.href fallback — that broke handler-only embeds).
   */
  CrazzyPe.prototype._handleSuccess = function (data) {
    var self = this;
    data = data || {};
    var explicitCallback = this.options.callback_url || "";
    var redirectUrl = explicitCallback
      ? data.redirect_url || explicitCallback
      : "";

    this._renderModal(
      "success",
      Object.assign({}, data, { redirect_url: redirectUrl || explicitCallback }),
    );

    var response = {
      crazzype_payment_id: data.payment_id || data.order_id,
      crazzype_order_id: data.order_id || this.options.order_id,
      crazzype_signature: data.signature || data.hash,
      order_id: data.order_id || this.options.order_id,
      payment_id: data.payment_id,
      signature: data.signature || data.hash,
      redirect_url: redirectUrl || explicitCallback || "",
    };

    setTimeout(function () {
      try {
        if (typeof self.options.handler === "function") {
          self.options.handler(response);
        }
      } catch (err) {
        console.error("CrazzyPe: handler error", err);
      }
      try {
        if (typeof self.options.onSuccess === "function") {
          self.options.onSuccess(response);
        }
      } catch (err2) {
        console.error("CrazzyPe: onSuccess error", err2);
      }

      // Legacy PHP / callback_url flows only
      if (explicitCallback) {
        window.location.href = redirectUrl || explicitCallback;
      } else {
        self.close();
      }
    }, 2500);
  };

  /**
   * Handle failure
   */
  CrazzyPe.prototype._handleFailure = function (data) {
    this._renderModal("error", {
      title: "Payment Failed",
      message: data.error_description || "Something went wrong",
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
    this._renderModal("error", {
      title: "Error",
      message: message,
    });
  };

  /**
   * Close the modal
   */
  CrazzyPe.prototype.close = function () {
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
   * Format amount for display
   */
  CrazzyPe.prototype._formatAmount = function (amount) {
    var num = this._normalizeAmountRupees(amount);
    return num.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
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
