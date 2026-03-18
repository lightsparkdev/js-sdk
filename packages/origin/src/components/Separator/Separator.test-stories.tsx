"use client";

import { Separator } from "./Separator";

export function DefaultSeparator() {
  return (
    <div style={{ width: "200px" }}>
      <Separator />
    </div>
  );
}

export function HairlineSeparator() {
  return (
    <div style={{ width: "200px" }}>
      <Separator variant="hairline" />
    </div>
  );
}

export function VerticalSeparator() {
  return (
    <div style={{ display: "flex", height: "48px", alignItems: "center" }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  );
}

export function VerticalHairlineSeparator() {
  return (
    <div style={{ display: "flex", height: "48px", alignItems: "center" }}>
      <span>Left</span>
      <Separator orientation="vertical" variant="hairline" />
      <span>Right</span>
    </div>
  );
}

export function AllVariants() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "200px",
      }}
    >
      <div>
        <p style={{ marginBottom: "8px" }}>Default (1px)</p>
        <Separator />
      </div>
      <div>
        <p style={{ marginBottom: "8px" }}>Hairline (0.5px)</p>
        <Separator variant="hairline" />
      </div>
      <div
        style={{
          display: "flex",
          height: "48px",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>Vertical Default</span>
        <Separator orientation="vertical" />
        <span>Text</span>
      </div>
      <div
        style={{
          display: "flex",
          height: "48px",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>Vertical Hairline</span>
        <Separator orientation="vertical" variant="hairline" />
        <span>Text</span>
      </div>
    </div>
  );
}

export function CustomClassSeparator() {
  return (
    <div style={{ width: "200px" }}>
      <Separator className="custom-class" />
    </div>
  );
}

export function InNavigation() {
  return (
    <nav
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
        height: "32px",
      }}
    >
      <a href="#">Home</a>
      <a href="#">Pricing</a>
      <a href="#">Blog</a>
      <Separator orientation="vertical" />
      <a href="#">Log in</a>
      <a href="#">Sign up</a>
    </nav>
  );
}
