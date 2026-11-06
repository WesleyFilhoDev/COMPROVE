"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    document.body.classList.add("js-reveal");

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.body.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
