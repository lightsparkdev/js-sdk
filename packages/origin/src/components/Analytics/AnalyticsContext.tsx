"use client";

import * as React from "react";

export type InteractionType =
  | "click"
  | "open"
  | "close"
  | "submit"
  | "error"
  | "change"
  | "select"
  | "expand"
  | "collapse"
  | "sort";

export interface InteractionInfo {
  name: string;
  component: string;
  interaction: InteractionType;
  metadata?: Record<string, unknown> | undefined;
}

export interface AnalyticsHandler {
  onInteraction: (info: InteractionInfo) => void;
}

const AnalyticsContext = React.createContext<AnalyticsHandler | null>(null);

export function useAnalyticsContext(): AnalyticsHandler | null {
  return React.useContext(AnalyticsContext);
}

export interface AnalyticsProviderProps {
  value: AnalyticsHandler;
  children: React.ReactNode;
}

export function AnalyticsProvider({ value, children }: AnalyticsProviderProps) {
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
