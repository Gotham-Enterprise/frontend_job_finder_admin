"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import type { EmailBlock } from "./utils/blockTypes";
import { generateEmailHTML } from "./utils/generateEmailHTML";
import { substituteMergeTagsForPreview } from "./utils/mergeTags";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: EmailBlock[];
  subject: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

type DeviceMode = "desktop" | "mobile";

function buildPreviewDocument(contentHtml: string, subject: string, showHeader = true, showFooter = true): string {
  const safeSubject = subject
    ? subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "Newsletter Preview";

  const year = new Date().getFullYear();

  // Use absolute URLs so the iframe srcDoc can resolve them from the same origin
  const base = "/images/email";

  const socialLinks = [
    { cid: "xIcon",           src: `${base}/x_icon.png`,          href: "https://x.com/gothamltdjobs",                                        alt: "X" },
    { cid: "linkedin",        src: `${base}/linkedin_icon.png`,    href: "https://www.linkedin.com/company/gothamenterprisesltd/posts/?feedView=all", alt: "LinkedIn" },
    { cid: "pinterestIcon",   src: `${base}/pinterest_icon.png`,   href: "https://in.pinterest.com/gothamenterprisesltd/",                     alt: "Pinterest" },
    { cid: "instagramIcon",   src: `${base}/instagram_icon.png`,   href: "https://www.instagram.com/gothamltdjobs/",                           alt: "Instagram" },
    { cid: "fb",              src: `${base}/facebook_icon.png`,    href: "https://www.facebook.com/profile.php?id=61567708988056",             alt: "Facebook" },
    { cid: "tiktokIcon",      src: `${base}/tiktok_icon.png`,      href: "https://www.tiktok.com/@gotham.enterprisesltd",                      alt: "TikTok" },
    { cid: "youtubeIcon",     src: `${base}/youtube_icon.png`,     href: "https://www.youtube.com/@gothamenterprisesltd",                      alt: "YouTube" },
  ];

  const socialIconsHtml = socialLinks
    .map(
      (s) =>
        `<td style="padding:0 4px;">
          <a href="${s.href}" target="_blank" style="display:block;">
            <img src="${s.src}" alt="${s.alt}" width="24" height="24" style="display:block;border:none;" />
          </a>
        </td>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f4f4f4;
      font-family: Inter, Arial, sans-serif;
      padding: 20px 0 40px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    /* ── Logo bar ── */
    .email-logo-bar {
      background: #f4f4f4;
      text-align: center;
      padding: 20px 0;
    }
    .email-logo-bar img {
      height: 40px;
      width: auto;
      display: inline-block;
    }
    /* ── Hero ── */
    .email-hero {
      position: relative;
      background-color: #0a3d62;
      background-image: url('${base}/bg_email.png');
      background-size: cover;
      background-position: center;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .email-hero-subject {
      position: relative;
      z-index: 1;
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      padding: 10px 20px;
      text-align: center;
      line-height: 1.3;
    }
    /* ── Body ── */
    .email-body {
      padding: 30px 30px 30px;
      background: #ffffff;
    }
    .email-greeting {
      font-size: 14px;
      color: #333333;
      margin-bottom: 10px;
      line-height: 1.6;
    }
    /* Content block styles (mirrors .newsletter-content in MJML) */
    .newsletter-content {
      font-family: Inter, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
    }
    .newsletter-content img { max-width: 100%; height: auto; }
    .newsletter-content a { color: #0a3d62; }
    .newsletter-content h1,
    .newsletter-content h2,
    .newsletter-content h3 { color: #0a3d62; }
    .newsletter-content p { margin: 0 0 12px; }
    .newsletter-content ul,
    .newsletter-content ol { padding-left: 20px; margin-bottom: 12px; }
    .newsletter-content ul li,
    .newsletter-content ol li { font-size: 14px; line-height: 1.6; color: #333; }
    /* ── Footer ── */
    .email-footer {
      background: #f9f9f9;
      border-top: 1px solid #eeeeee;
      padding: 20px 30px;
      text-align: center;
      border-radius: 0 0 6px 6px;
    }
    .email-footer table { margin: 0 auto 10px; border-collapse: collapse; }
    .email-footer img { display: block; border: none; }
    .email-footer-copy {
      font-size: 12px;
      color: #666666;
      margin-bottom: 4px;
    }
    .email-footer-note {
      font-size: 11px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">

    <!-- Logo -->
    <!--<div class="email-logo-bar">
      <img src="${base}/gotham_logo.png" alt="Gotham Enterprises Ltd" />
    </div>-->

    <!-- Hero -->
    ${showHeader ? `
    <div class="email-hero">
      <div class="email-hero-subject">${safeSubject}</div>
    </div>` : ''}

    <!-- Greeting + Content -->
    <div class="email-body">
      <div class="newsletter-content">
        ${contentHtml}
      </div>
    </div>

    <!-- Footer -->
    ${showFooter ? `
    <div class="email-footer">
      <table width="250" align="center" style="margin:0 auto 10px;">
        <tr>
          ${socialIconsHtml}
        </tr>
      </table>
      <p class="email-footer-copy">
        &copy; ${year} Gotham Enterprises Ltd. All rights reserved.
      </p>
      <p class="email-footer-note">
        You are receiving this newsletter because you have an account with Gotham Enterprises.
      </p>
    </div>` : ''}

  </div>
</body>
</html>`;
}

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 660,
  mobile: 400,
};

export function PreviewModal({ isOpen, onClose, blocks, subject, showHeader = true, showFooter = true }: PreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(600);

  const contentHtml = substituteMergeTagsForPreview(generateEmailHTML(blocks));
  const previewSubject = substituteMergeTagsForPreview(subject);
  const doc = buildPreviewDocument(contentHtml, previewSubject, showHeader, showFooter);

  // Resize iframe to fit content after load
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const h = iframe.contentDocument?.documentElement?.scrollHeight;
      if (h && h > 0) setIframeHeight(h + 16);
    } catch {
      // cross-origin: ignore
    }
  }, []);

  // Re-measure when device changes
  useEffect(() => {
    if (iframeRef.current) handleIframeLoad();
  }, [device, doc, handleIframeLoad]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          width: "100%",
          maxWidth: `${DEVICE_WIDTHS[device] + 48}px`,
          maxHeight: "92vh",
          background: "#f1f5f9",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          transition: "max-width 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#1e293b",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          {/* Left: title */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>Email Preview</span>
            {subject && (
              <span style={{ fontSize: "11px", color: "#64748b", maxWidth: "260px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                — {previewSubject}
              </span>
            )}
          </div>

          {/* Center: device toggle */}
          <div style={{ display: "flex", alignItems: "center", background: "#0f172a", borderRadius: "8px", padding: "3px" }}>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              title="Desktop view"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
                background: device === "desktop" ? "#3b82f6" : "transparent",
                color: device === "desktop" ? "#fff" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" strokeLinecap="round" />
              </svg>
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="Mobile view"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
                background: device === "mobile" ? "#3b82f6" : "transparent",
                color: device === "mobile" ? "#fff" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" strokeLinecap="round" />
              </svg>
              Mobile
            </button>
          </div>

          {/* Right: close */}
          <button
            type="button"
            onClick={onClose}
            title="Close preview (Esc)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "6px",
              border: "none",
              background: "#334155",
              color: "#94a3b8",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scroll area for iframe */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 16px 20px" }}>
          {blocks.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                color: "#64748b",
                gap: "12px",
                textAlign: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: "14px", fontWeight: 500 }}>No blocks added yet</p>
              <p style={{ fontSize: "12px" }}>Add blocks to the canvas to preview your email</p>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={doc}
              title="Email preview"
              onLoad={handleIframeLoad}
              style={{
                width: "100%",
                height: `${iframeHeight}px`,
                border: "none",
                borderRadius: "6px",
                display: "block",
                background: "#ffffff",
              }}
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
}
