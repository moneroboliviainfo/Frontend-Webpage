'use client';

import React, { useEffect, useState, useRef } from 'react';
import { API_URL } from '@/config/env';
import useIsMobile from '@/hooks/useIsMobile';
import SectionHeader from './SectionHeader';
import './VideoBanner.css';

type VideoBannerProps = {
  gender: 'male' | 'female';
};

const VideoBanner: React.FC<VideoBannerProps> = ({ gender }) => {
  const isMobileHook = useIsMobile();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchBanners() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}banners`, { signal: ac.signal });
        if (!res.ok) throw new Error('Failed to fetch banners');
        const data: Array<{
          id: number;
          type: string;
          gender: string;
          video?: string;
        }> = await res.json();

        const desiredType = isMobileHook ? 'mobile' : 'desktop';

        // Prefer exact match (type + gender)
        let found = data.find(
          (b) => b.gender === gender && b.type === desiredType && b.video,
        );

        // Fallback to same gender any type
        if (!found) found = data.find((b) => b.gender === gender && b.video);

        // Fallback to any gender same type
        if (!found) found = data.find((b) => b.type === desiredType && b.video);

        setVideoUrl(found?.video ?? null);
      } catch (err) {
        if ((err as any).name !== 'AbortError') console.error(err);
        setVideoUrl(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();

    return () => {
      ac.abort();
    };
  }, [gender, isMobileHook]);

  // Set up observer after the video URL is available and refs are attached
  useEffect(() => {
    if (!videoUrl) return;

    const obsTarget = containerRef.current;
    const videoEl = videoRef.current;

    if (!obsTarget || !videoEl) return;

    // Ensure muted property matches state (important for autoplay)
    videoEl.muted = isMuted;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            videoEl
              .play()
              .catch((err) => console.debug('Video autoplay failed:', err));
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: [0.25] },
    );

    observer.observe(obsTarget);

    return () => observer.disconnect();
  }, [videoUrl, isMuted]);

  if (loading) return null;
  if (!videoUrl) return null;

  return (
    <section className="video-banner" ref={containerRef as any}>
      <div style={{ marginBottom: '0.6rem' }}>
        <SectionHeader
          title="ACERCA DE NOSOTROS"
          fontColor="white"
          isMobile={isMobileHook}
        />
      </div>
      <div className="video-banner__inner">
        <div className="video-banner__wrap">
          <video
            ref={videoRef}
            className="video-banner__video"
            src={videoUrl}
            muted={isMuted}
            autoPlay
            loop
            playsInline
            // controls intentionally removed; user toggles mute by clicking
            tabIndex={0}
            aria-label="Video de la colección. Presione espacio o enter para silenciar/activar sonido."
            onClick={() => {
              setIsMuted((m) => {
                const next = !m;
                if (videoRef.current) videoRef.current.muted = next;
                return next;
              });
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsMuted((m) => {
                  const next = !m;
                  if (videoRef.current) videoRef.current.muted = next;
                  return next;
                });
              }
            }}
          />
          {isMuted && (
            <div className="video-banner__mutedOverlay" aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 9v6h4l5 4V5L9 9H5z"
                  fill="currentColor"
                  opacity="0.95"
                />
                <path
                  d="M16 8.5L17.5 10 19 8.5 20.5 10 19 11.5 20.5 13 19 14.5 17.5 13 16 14.5 14.5 13 16 11.5 14.5 10 16 8.5z"
                  fill="currentColor"
                />
              </svg>
              <span className="video-banner__mutedText">
                Toca para activar sonido
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoBanner;
