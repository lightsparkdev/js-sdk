"use client";

import { Avatar } from "./Avatar";

export function DefaultAvatar() {
  return (
    <Avatar.Root>
      <Avatar.Fallback>CS</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AvatarWithImage() {
  return (
    <Avatar.Root size="48" variant="circle">
      <Avatar.Image
        src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
        alt="User avatar"
        data-testid="avatar-image"
      />
      <Avatar.Fallback data-testid="avatar-fallback">LT</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AvatarWithBrokenImage() {
  return (
    <Avatar.Root size="48" variant="circle" data-testid="avatar-root">
      <Avatar.Image
        src="https://invalid-url.example/broken.jpg"
        alt="Broken image"
        data-testid="avatar-image"
      />
      <Avatar.Fallback data-testid="avatar-fallback">FB</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function SquircleVariant() {
  return (
    <Avatar.Root variant="squircle" data-testid="avatar-squircle">
      <Avatar.Fallback>SQ</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function CircleVariant() {
  return (
    <Avatar.Root variant="circle" data-testid="avatar-circle">
      <Avatar.Fallback>CI</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AllSizes() {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Avatar.Root size="16" data-testid="size-16">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="20" data-testid="size-20">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="24" data-testid="size-24">
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="32" data-testid="size-32">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="40" data-testid="size-40">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="48" data-testid="size-48">
        <Avatar.Fallback>CS</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}

export function AllColors() {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Avatar.Root color="blue" data-testid="color-blue">
        <Avatar.Fallback>BL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="purple" data-testid="color-purple">
        <Avatar.Fallback>PU</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="sky" data-testid="color-sky">
        <Avatar.Fallback>SK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="pink" data-testid="color-pink">
        <Avatar.Fallback>PK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="green" data-testid="color-green">
        <Avatar.Fallback>GR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="yellow" data-testid="color-yellow">
        <Avatar.Fallback>YE</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="red" data-testid="color-red">
        <Avatar.Fallback>RE</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root color="gray" data-testid="color-gray">
        <Avatar.Fallback>GY</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}

export function CustomClassAvatar() {
  return (
    <Avatar.Root className="custom-class" data-testid="custom-class">
      <Avatar.Fallback>CC</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function FallbackWithDelay() {
  return (
    <Avatar.Root size="48" data-testid="delayed-fallback">
      <Avatar.Image
        src="https://very-slow-server.example/image.jpg"
        alt="Slow loading image"
      />
      <Avatar.Fallback delay={200} data-testid="fallback">
        DL
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
