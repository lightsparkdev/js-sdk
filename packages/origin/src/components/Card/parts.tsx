"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./Card.module.scss";

// Context for variant
type CardVariant = "structured" | "simple";

interface CardContextValue {
  variant: CardVariant;
}

const CardContext = React.createContext<CardContextValue | undefined>(
  undefined,
);

function useCardContext() {
  const context = React.useContext(CardContext);
  if (context === undefined) {
    throw new Error("Card parts must be placed within <Card>.");
  }
  return context;
}

// Root
export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  children?: React.ReactNode;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { variant = "structured", className, children, ...props },
  ref,
) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div
        ref={ref}
        className={clsx(styles.root, styles[variant], className)}
        {...props}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
});

// Header (structured variant only)
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  function Header({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

// BackButton
export interface BackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  function BackButton({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(styles.backButton, className)}
        aria-label="Go back"
        {...props}
      >
        <CentralIcon name="IconChevronLeft" size={16} />
      </button>
    );
  },
);

// TitleGroup (wraps Title + Subtitle with gap)
export interface TitleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const TitleGroup = React.forwardRef<HTMLDivElement, TitleGroupProps>(
  function TitleGroup({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.titleGroup, className)} {...props}>
        {children}
      </div>
    );
  },
);

// Title
export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title({ className, children, ...props }, ref) {
    return (
      <h2 ref={ref} className={clsx(styles.title, className)} {...props}>
        {children}
      </h2>
    );
  },
);

// Subtitle
export interface SubtitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const Subtitle = React.forwardRef<HTMLParagraphElement, SubtitleProps>(
  function Subtitle({ className, children, ...props }, ref) {
    return (
      <p ref={ref} className={clsx(styles.subtitle, className)} {...props}>
        {children}
      </p>
    );
  },
);

// Body
export interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fullwidth removes horizontal padding for edge-to-edge content */
  fullwidth?: boolean;
  children?: React.ReactNode;
}

export const Body = React.forwardRef<HTMLDivElement, BodyProps>(function Body(
  { fullwidth = false, className, children, ...props },
  ref,
) {
  const { variant } = useCardContext();
  return (
    <div
      ref={ref}
      className={clsx(
        styles.body,
        variant === "structured" && !fullwidth && styles.bodyStructured,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Footer (structured variant only)
export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "Card";
  Header.displayName = "Card.Header";
  BackButton.displayName = "Card.BackButton";
  TitleGroup.displayName = "Card.TitleGroup";
  Title.displayName = "Card.Title";
  Subtitle.displayName = "Card.Subtitle";
  Body.displayName = "Card.Body";
  Footer.displayName = "Card.Footer";
}
