/**
 * Central Icon Wrapper - Complete Icon Registry
 *
 * All icons from the Figma design system are available.
 * Strokes scale proportionally with icon size via the library's `size` prop.
 */

import React from "react";
import { devWarnOnce } from "../../lib/dev-warn";
import { ICON_REGISTRY, type CentralIconName } from "./icon-registry";

export interface CentralIconProps {
  /** Icon name from the registry */
  name: CentralIconName;
  /** Icon size in pixels */
  size?: number;
  /**
   * Color override. When omitted, the icon inherits `currentColor` through
   * CSS with no inline style, so stylesheet rules targeting the svg apply.
   */
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
  color,
  className,
  style,
}) => {
  const IconComponent = ICON_REGISTRY[name];

  if (!IconComponent) {
    devWarnOnce(`CentralIcon: Icon "${name}" not found in registry`);
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
