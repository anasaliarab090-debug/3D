/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for typewriter text revelation
 */
function useTypewriter(text: string, speed: number = 38, startDelay: number = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

const NAV_LINKS = [
  { label: 'Labs', href: '#labs' },
  { label: 'Studio', href: '#studio' },
  { label: 'Openings', href: '#openings' },
  { label: 'Shop', href: '#shop' },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Typewriter hook for hero message
  const { displayed, done } = useTypewriter(
    'Glad you stopped in. Good taste tends to find us. Now, what are we building?',
    38,
    600
  );

  // Video scrubbing refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // Action pill buttons fade-in & slide-up 400ms after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Handle video seeked event to queue next seek without flooding
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  }, []);

  // Scrub video forward/backward on horizontal mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const SENSITIVITY = 0.8;
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(video.duration, targetTimeRef.current + offset));

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    // Touch scrubbing support for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const SENSITIVITY = 0.8;
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(video.duration, targetTimeRef.current + offset));

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = 'hello@mainframe.co';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#8c0006]">
      {/* Studio red gradient background that smoothly blends into the video */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 75% 50%, #c80010 0%, #aa0009 45%, #880006 100%)',
        }}
      />

      {/* BACKGROUND VIDEO (mouse-scrub controlled, positioned on far right with proportions preserved) */}
      <video
        ref={videoRef}
        src="/assets/aistudio/kling_20261023_VIDEO_animate__5398_0_0af50c82.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            targetTimeRef.current = videoRef.current.currentTime || 0;
          }
        }}
        className="fixed top-0 right-0 h-[65vh] sm:h-[75vh] md:h-screen w-auto max-w-none pointer-events-none z-0"
        style={{
          transform: 'translateX(25%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
        }}
      />

      {/* Mobile bottom readability protection gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#880006] via-[#880006]/80 to-transparent md:hidden pointer-events-none z-0" />

      {/* NAVBAR (fixed, z-index: 10) - All text white for contrast */}
      <header className="fixed top-0 left-0 right-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex row justify-between items-center">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-[21px] sm:text-[26px] tracking-tight text-white font-medium leading-none"
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav
          className="hidden md:flex items-center text-[23px] text-white"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link, idx) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                className="hover:opacity-75 transition-opacity"
              >
                {link.label}
              </a>
              {idx < NAV_LINKS.length - 1 && <span>,&nbsp;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <a
          href="mailto:hello@mainframe.co"
          className="hidden md:inline-block text-[23px] text-white underline underline-offset-2 hover:opacity-75 transition-opacity"
        >
          Get in touch
        </a>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 focus:outline-none cursor-pointer z-20"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 origin-center ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 origin-center ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-[#880006]/95 backdrop-blur-md flex flex-col justify-center px-8 gap-8 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className="text-[32px] font-medium text-white hover:opacity-75 transition-opacity text-left"
          >
            {link.label}
          </a>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[32px] font-medium text-white underline underline-offset-2 hover:opacity-75 transition-opacity text-left"
        >
          Get in touch
        </a>
      </div>

      {/* HERO SECTION (z-index: 1) - Left-aligned content without overlapping character */}
      <section className="relative z-[1] w-full h-screen flex flex-col justify-end pb-10 sm:pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-md lg:max-w-lg xl:max-w-xl text-left relative z-10">
          {/* 1. Blurred intro label - in white for clear contrast */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6 text-left"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#ffffff',
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text - in white */}
          <p
            className="text-white mb-5 sm:mb-6 text-left"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] cursor-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons - Aligned on the left side */}
          <div
            className="flex flex-wrap gap-y-1 justify-start items-center"
            style={{
              opacity: buttonsVisible ? 1 : 0,
              transform: buttonsVisible ? 'translateY(0px)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 white pill buttons */}
            <a
              href="mailto:hello@mainframe.co?subject=Pitch%20an%20Idea"
              className="inline-flex items-center justify-center bg-white text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Pitch us an idea
            </a>
            <a
              href="#openings"
              className="inline-flex items-center justify-center bg-white text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Come work here
            </a>
            <a
              href="mailto:hello@mainframe.co?subject=Hello"
              className="inline-flex items-center justify-center bg-white text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Send a brief hello
            </a>
            <a
              href="#studio"
              className="inline-flex items-center justify-center bg-white text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              See how we operate
            </a>

            {/* 1 outline pill button */}
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200"
              title="Click to copy email"
            >
              <span>
                Reach us:{' '}
                <span className="underline underline-offset-1">
                  hello@mainframe.co
                </span>
              </span>

              {/* Small 12x12 copy icon (inline SVG of two overlapping rectangles) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                aria-hidden="true"
              >
                {/* Back rectangle */}
                <path d="M2.5 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v0.5" />
                {/* Front rectangle */}
                <rect x="4" y="4" width="7" height="7" rx="1" />
              </svg>

              {copied && (
                <span className="text-[11px] sm:text-[12px] text-white/90 font-normal">
                  (Copied!)
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
