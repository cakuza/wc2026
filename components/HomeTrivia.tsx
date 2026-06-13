"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const TriviaCard = dynamic(
  () => import("@/components/TriviaCard").then((mod) => mod.TriviaCard),
  { ssr: false }
);

export function HomeTrivia() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{shouldLoad ? <TriviaCard /> : null}</div>;
}
