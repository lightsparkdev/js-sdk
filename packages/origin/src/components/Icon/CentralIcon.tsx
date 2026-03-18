/**
 * Central Icon Wrapper - Complete Icon Registry
 *
 * All icons from the Figma design system are available.
 * Strokes scale proportionally with icon size via the library's `size` prop.
 */

import React from "react";
import { devWarn } from "../../lib/dev-warn";
import { ICON_REGISTRY, type CentralIconName } from "./icon-registry";

export interface CentralIconProps {
  /** Icon name from the registry */
  name: CentralIconName;
  /** Icon size in pixels */
  size?: number;
  /** Color override */
  color?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Central Icon component
 *
 * Renders icons from the Central Icons registry. Strokes scale
 * proportionally with size — a 1.5px stroke at 24px becomes ~1px at 16px.
 */
export const CentralIcon: React.FC<CentralIconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  className,
  style,
}) => {
  const IconComponent = ICON_REGISTRY[name];

  if (!IconComponent) {
    devWarn(`CentralIcon: Icon "${name}" not found in registry`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={style}
    />
  );
};

export default CentralIcon;
export type { CentralIconName };
