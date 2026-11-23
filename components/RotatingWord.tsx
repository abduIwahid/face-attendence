"use client";

import { useEffect, useState } from "react";

/**
 * The Aurora landing hero's rotating word (ADR-011): one word swaps for
 * the next on an interval, each entering with the word-in rise. Under
 * prefers-reduced-motion the first word simply stays — no cycling, no
 * animation (the globals.css reduced-motion block also kills the keyframe).
 */
export default function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <span key={index} className="animate-word-in text-accent" aria-live="off">
      {words[index]}
    </span>
  );
}
