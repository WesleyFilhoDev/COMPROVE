import React from "react";

type LogoProps = {
  size?: number;
  tone?: "positive" | "negative";
  variant?: "horizontal" | "symbol";
};

export function Logo({
  size = 32,
  tone = "positive",
  variant = "horizontal",
}: LogoProps) {
  const isNegative = tone === "negative";

  // Symbol colors
  const cStroke = isNegative ? "#ffffff" : "var(--marinho, #0b1b3f)";
  const kStroke = isNegative
    ? "var(--azul-sinal, #6b8fff)"
    : "var(--azul-eletrico, #2a5bff)";

  // Wordmark colors
  const wordColor = isNegative ? "#ffffff" : "var(--tinta, #0f1a2e)";
  const dColor = isNegative
    ? "var(--azul-sinal, #6b8fff)"
    : "var(--azul-eletrico, #2a5bff)";

  const symbol = (
    <svg
      width={size}
      height={size}
      viewBox="9 9 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* C arc */}
      <path
        d="M30.88 14.17A12 12 0 1 0 30.88 33.83"
        stroke={cStroke}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Checkmark */}
      <path
        d="M16.5 24L21.5 29L36.5 18"
        stroke={kStroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (variant === "symbol") {
    return symbol;
  }

  const fontSize = Math.round(size * 0.56);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(size * 0.28),
        lineHeight: 1,
      }}
    >
      {symbol}
      <span
        style={{
          fontFamily: "var(--font-display, Manrope, sans-serif)",
          fontWeight: 800,
          fontSize,
          color: wordColor,
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        Comprove
        <span style={{ color: dColor }}>d</span>
      </span>
    </span>
  );
}
