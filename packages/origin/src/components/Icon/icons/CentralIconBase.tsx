import type { FC, SVGProps } from "react";

export type CentralIconBaseProps = {
  size?: string | number;
  ariaHidden?: boolean;
} & SVGProps<SVGSVGElement>;

export const CentralIconBase: FC<
  CentralIconBaseProps & { ariaLabel?: string }
> = ({
  children,
  size = 24,
  ariaLabel,
  color,
  ariaHidden = true,
  style,
  ...rest
}) => (
  <svg
    {...rest}
    aria-hidden={ariaHidden}
    role={ariaHidden ? undefined : "img"}
    width={typeof size === "number" ? `${size}px` : size}
    height={typeof size === "number" ? `${size}px` : size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color, ...style }}
  >
    {ariaLabel && !ariaHidden && <title>{ariaLabel}</title>}
    {children}
  </svg>
);
