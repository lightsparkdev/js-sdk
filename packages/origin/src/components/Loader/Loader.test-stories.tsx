"use client";

import { Loader } from "./Loader";

export function DefaultLoader() {
  return <Loader />;
}

export function RingLoader() {
  return <Loader variant="ring" />;
}

export function RingSmallLoader() {
  return <Loader variant="ring" size={12} />;
}

export function RingCustomLabel() {
  return <Loader variant="ring" label="Settling" />;
}
