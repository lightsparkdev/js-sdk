"use client";

import { Logo } from "./Logo";

export function DefaultLogo() {
  return <Logo aria-label="Lightspark" />;
}

export function LogoRegular() {
  return <Logo variant="logo" weight="regular" aria-label="Lightspark" />;
}

export function LogoLight() {
  return <Logo variant="logo" weight="light" aria-label="Lightspark" />;
}

export function LogomarkRegular() {
  return <Logo variant="logomark" weight="regular" aria-label="Lightspark" />;
}

export function LogomarkLight() {
  return <Logo variant="logomark" weight="light" aria-label="Lightspark" />;
}

export function WordmarkRegular() {
  return <Logo variant="wordmark" aria-label="Lightspark" />;
}

export function AllVariants() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Logo
        variant="logo"
        weight="regular"
        aria-label="Lightspark logo regular"
      />
      <Logo variant="logo" weight="light" aria-label="Lightspark logo light" />
      <Logo
        variant="logomark"
        weight="regular"
        aria-label="Lightspark logomark regular"
      />
      <Logo
        variant="logomark"
        weight="light"
        aria-label="Lightspark logomark light"
      />
      <Logo variant="wordmark" aria-label="Lightspark wordmark" />
    </div>
  );
}

export function CustomHeight() {
  return <Logo height={40} aria-label="Lightspark" />;
}

export function CustomClassName() {
  return <Logo className="custom-logo-class" aria-label="Lightspark" />;
}
