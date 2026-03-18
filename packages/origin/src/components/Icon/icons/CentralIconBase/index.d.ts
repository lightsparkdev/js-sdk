import type React from "react";
import type { SVGProps } from "react";
export type CentralIconBaseProps = {
  size?: string | number;
  ariaHidden?: boolean;
} & SVGProps<SVGSVGElement>;
export declare const CentralIconBase: React.FC<
  CentralIconBaseProps & {
    ariaLabel?: string;
  }
>;
