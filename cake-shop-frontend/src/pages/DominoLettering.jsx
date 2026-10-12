// src/pages/DominoLettering.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/* ------------------------------------------------------------
   Display font (Fraunces: soft, warm serif, perfect for a bakery)
   Loaded once from Google Fonts. Pass fontFamily="inherit" to opt out.
   ------------------------------------------------------------ */
const FONT_LINK_ID = "domino-lettering-font";
const DEFAULT_FONT = '"Fraunces", "Playfair Display", Georgia, serif';

const useDisplayFont = (enabled) => {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&display=swap";
    document.head.appendChild(link);
  }, [enabled]);
};

/**
 * DominoLettering
 * Letters lie fallen, then stand up one after another like a domino wave.
 *
 * Props
 *  - fall:        "side" | "back"    how the letters tip over
 *  - direction:   "right" | "left"   direction the wave travels
 *  - stagger:     seconds between neighbouring letters
 *  - gravity:     higher = letters drop faster
 *  - lean:        angle (deg) of a fallen letter
 *  - stiffness:   spring stiffness when standing up
 *  - damping:     spring damping (lower = bouncier)
 *  - hold:        seconds the letters stay fallen (click / loop)
 *  - shade:       opacity of fallen letters
 *  - loop:        keep toppling and standing up forever
 *  - clickTopple: click to topple the wave (starts from the clicked letter)
 *  - area:        "self" | "parent"  where a click is detected
 */
const DominoLettering = ({
  text = "One good move",
  as: Tag = "h1",
  color = "currentColor",
  fall = "side",
  direction = "right",
  stagger = 0.03,
  gravity = 1,
  lean = 58,
  stiffness = 1,
  damping = 0.55,
  hold = 1.2,
  shade = 0.5,
  loop = false,
  clickTopple = true,
  area = "self",
  fontFamily = DEFAULT_FONT,
  textShadow = "0 2px 0 rgba(93,58,26,0.35), 0 10px 28px rgba(0,0,0,0.28)",
  className = "",
  style,
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useDisplayFont(fontFamily === DEFAULT_FONT);

  /* ---------- split text into words / letters (global index kept) ---------- */
  const { words, total } = useMemo(() => {
    let counter = 0;
    const list = text
      .split(" ")
      .filter(Boolean)
      .map((word) => word.split("").map((ch) => ({ ch, i: counter++ })));
    return { words: list, total: counter };
  }, [text]);

  const dir = direction === "left" ? -1 : 1;
  const introOrigin = direction === "left" ? Math.max(total - 1, 0) : 0;

  const [phase, setPhase] = useState("fallen");
  const [origin, setOrigin] = useState(introOrigin);
  const busy = useRef(false);
  const timers = useRef([]);
  const triggerRef = useRef(() => {});

  const fallDuration = 0.5 / Math.max(gravity, 0.2);
  const waveTime = Math.max(total - 1, 0) * stagger + fallDuration + 0.5;

  const later = (fn, seconds) => {
    const id = setTimeout(fn, seconds * 1000);
    timers.current.push(id);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- intro: stand up when scrolled into view ---------- */
  useEffect(() => {
    if (!inView) return;
    setOrigin(introOrigin);
    setPhase("standing");
  }, [inView, introOrigin]);

  /* ---------- optional endless loop ---------- */
  useEffect(() => {
    if (!inView || !loop) return;
    let cancelled = false;
    const ids = [];

    const cycle = () => {
      ids.push(
        setTimeout(() => {
          if (cancelled) return;
          setOrigin(introOrigin);
          setPhase("fallen");
          ids.push(
            setTimeout(() => {
              if (cancelled) return;
              setPhase("standing");
              cycle();
            }, (waveTime + hold) * 1000)
          );
        }, (hold + waveTime) * 1000)
      );
    };

    cycle();
    return () => {
      cancelled = true;
      ids.forEach(clearTimeout);
    };
  }, [inView, loop, hold, waveTime, introOrigin]);

  /* ---------- click to topple ---------- */
  triggerRef.current = (index) => {
    if (!clickTopple || loop || busy.current || !inView) return;
    busy.current = true;
    setOrigin(index);
    setPhase("fallen");
    later(() => {
      setPhase("standing");
      later(() => {
        busy.current = false;
      }, waveTime);
    }, waveTime + hold);
  };

  useEffect(() => {
    if (!clickTopple) return;
    const el = area === "parent" ? ref.current?.parentElement : ref.current;
    if (!el) return;

    const onClick = (event) => {
      // don't hijack real buttons / links inside the same area
      if (event.target.closest?.("a, button, input, textarea, select, label")) return;
      const letter = event.target.closest?.("[data-i]");
      const index = letter ? Number(letter.dataset.i) : introOrigin;
      triggerRef.current(index);
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [area, clickTopple, introOrigin]);

  /* ---------- letter animation ---------- */
  const variants = {
    fallen: (c) => ({
      rotate: fall === "side" ? lean * dir : 0,
      rotateX: fall === "back" ? lean : 0,
      opacity: shade,
      transition: {
        type: "tween",
        ease: "easeIn", // accelerates like a real fall
        duration: fallDuration,
        delay: c.delay,
      },
    }),
    standing: (c) => ({
      rotate: 0,
      rotateX: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 180 * stiffness,
        damping: 14 * damping,
        delay: c.delay,
      },
    }),
  };

  const pivot =
    fall === "side" ? (direction === "left" ? "0% 100%" : "100% 100%") : "50% 100%";

  const headingStyle = {
    color,
    fontFamily: fontFamily === "inherit" ? undefined : fontFamily,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textShadow,
    cursor: clickTopple && !loop ? "pointer" : undefined,
    ...style,
  };

  /* ---------- reduced motion: plain static text ---------- */
  if (reduceMotion) {
    return (
      <Tag ref={ref} className={className} style={headingStyle} {...rest}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      aria-label={text}
      className={`domino-lettering-container ${className}`}
      style={headingStyle}
      {...rest}
    >
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          <span className="inline-block whitespace-nowrap" aria-hidden="true">
            {word.map(({ ch, i }) => (
              <motion.span
                key={i}
                data-i={i}
                custom={{ delay: Math.abs(i - origin) * stagger }}
                variants={variants}
                initial="fallen"
                animate={phase}
                className="inline-block"
                style={{
                  transformOrigin: pivot,
                  transformPerspective: 600,
                  willChange: "transform, opacity",
                }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          {wordIndex < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default DominoLettering;