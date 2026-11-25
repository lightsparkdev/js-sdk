"use client";

import * as React from "react";

const DisabledContext = React.createContext(false);
DisabledContext.displayName = "DisabledContext";

interface DisabledProviderProps {
  children: React.ReactNode;
  disabled: boolean;
}

function DisabledProvider({ children, disabled }: DisabledProviderProps) {
  const inherited = React.useContext(DisabledContext);

  return (
    <DisabledContext.Provider value={inherited || disabled}>
      {children}
    </DisabledContext.Provider>
  );
}

export const FieldsetDisabledProvider = DisabledProvider;
export const FieldDisabledProvider = DisabledProvider;

export function useFieldDisabled() {
  return React.useContext(DisabledContext);
}
