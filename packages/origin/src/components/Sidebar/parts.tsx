"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Sidebar.module.scss";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

const TreeContext = React.createContext<boolean>(false);

function mergeRenderProps<T extends Record<string, unknown>>(
  render: React.ReactElement,
  props: T,
): T {
  const renderProps = render.props as Record<string, unknown>;
  const merged = { ...renderProps, ...props } as T;

  if (renderProps.className && props.className) {
    (merged as Record<string, unknown>).className = clsx(
      props.className as string,
      renderProps.className as string,
    );
  }

  if (renderProps.style && props.style) {
    (merged as Record<string, unknown>).style = {
      ...(renderProps.style as React.CSSProperties),
      ...(props.style as React.CSSProperties),
    };
  }

  if (renderProps.onClick && props.onClick) {
    (merged as Record<string, unknown>).onClick = (e: React.MouseEvent) => {
      (renderProps.onClick as (e: React.MouseEvent) => void)(e);
      (props.onClick as (e: React.MouseEvent) => void)(e);
    };
  }

  return merged;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within Sidebar.Provider");
  }
  return context;
}

export interface ProviderProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  analyticsName?: string;
  children: React.ReactNode;
}

export function Provider({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  analyticsName,
  children,
}: ProviderProps) {
  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const trackedCollapsedChange = useTrackedCallback(
    analyticsName,
    "Sidebar",
    "change",
    onCollapsedChange,
    (val: boolean) => ({ collapsed: val }),
  );

  const setCollapsed = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalCollapsed(value);
      }
      trackedCollapsedChange(value);
    },
    [isControlled, trackedCollapsedChange],
  );

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggle }),
    [collapsed, setCollapsed, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export interface RootProps extends React.ComponentPropsWithoutRef<"nav"> {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  width?: number | string;
  collapsedWidth?: number | string;
  itemSize?: number | string;
}

export const Root = React.forwardRef<HTMLElement, RootProps>(function Root(
  {
    collapsed: collapsedProp,
    onCollapsedChange,
    width,
    collapsedWidth,
    itemSize,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const context = React.useContext(SidebarContext);
  const isControlled = collapsedProp !== undefined;
  const [internalCollapsed, setInternalCollapsed] = React.useState(
    isControlled ? collapsedProp : false,
  );

  const collapsed = context
    ? context.collapsed
    : isControlled
    ? collapsedProp
    : internalCollapsed;

  const handleCollapsedChange = React.useCallback(
    (value: boolean) => {
      if (!context) {
        if (!isControlled) {
          setInternalCollapsed(value);
        }
        onCollapsedChange?.(value);
      }
    },
    [context, isControlled, onCollapsedChange],
  );

  const customStyles = {
    ...style,
    ...(width !== undefined && {
      "--sidebar-width": typeof width === "number" ? `${width}px` : width,
    }),
    ...(collapsedWidth !== undefined && {
      "--sidebar-width-collapsed":
        typeof collapsedWidth === "number"
          ? `${collapsedWidth}px`
          : collapsedWidth,
    }),
    ...(itemSize !== undefined && {
      "--sidebar-item-size":
        typeof itemSize === "number" ? `${itemSize}px` : itemSize,
    }),
  } as React.CSSProperties;

  const content = (
    <nav
      ref={ref}
      className={clsx(styles.root, className)}
      style={customStyles}
      data-collapsed={collapsed}
      aria-label="Sidebar navigation"
      {...props}
    >
      {children}
    </nav>
  );

  const implicitValue = React.useMemo(
    () => ({
      collapsed,
      setCollapsed: handleCollapsedChange,
      toggle: () => handleCollapsedChange(!collapsed),
    }),
    [collapsed, handleCollapsedChange],
  );

  if (context) {
    return content;
  }

  return (
    <SidebarContext.Provider value={implicitValue}>
      {content}
    </SidebarContext.Provider>
  );
});

export interface TriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  expandedIcon?: React.ReactNode;
  collapsedIcon?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(
    { expandedIcon, collapsedIcon, label, className, children, ...props },
    ref,
  ) {
    const { collapsed, toggle } = useSidebar();

    const defaultExpandedIcon = (
      <CentralIcon name="IconChevronLeft" size={20} />
    );
    const defaultCollapsedIcon = (
      <CentralIcon name="IconChevronRight" size={20} />
    );

    const icon = collapsed
      ? collapsedIcon ?? defaultCollapsedIcon
      : expandedIcon ?? defaultExpandedIcon;

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(styles.trigger, className)}
        onClick={toggle}
        aria-label={
          label ?? (collapsed ? "Expand sidebar" : "Collapse sidebar")
        }
        aria-expanded={!collapsed}
        {...props}
      >
        {children ?? icon}
      </button>
    );
  },
);

export interface HeaderProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  function Header({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

export interface ContentProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.content, className)} {...props}>
        {children}
      </div>
    );
  },
);

export interface FooterProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

export interface GroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.group, className)}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  },
);

export interface GroupLabelProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, children, ...props }, ref) {
    const { collapsed } = useSidebar();

    return (
      <div
        ref={ref}
        className={clsx(
          styles.groupLabel,
          collapsed && styles.visuallyHidden,
          className,
        )}
        role="heading"
        aria-level={2}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export interface MenuProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(styles.menu, className)}
      role="menu"
      {...props}
    >
      {children}
    </div>
  );
});

export interface TreeProps extends React.ComponentPropsWithoutRef<"div"> {
  label?: string;
}

export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(function Tree(
  { label = "File tree", className, children, ...props },
  ref,
) {
  return (
    <TreeContext.Provider value={true}>
      <div
        ref={ref}
        className={clsx(styles.menu, className)}
        role="tree"
        aria-label={label}
        {...props}
      >
        {children}
      </div>
    </TreeContext.Provider>
  );
});

export interface ItemProps extends React.ComponentPropsWithoutRef<"button"> {
  icon?: React.ReactNode;
  active?: boolean;
  trailing?: React.ReactNode;
  render?: React.ReactElement;
}

export const Item = React.forwardRef<HTMLButtonElement, ItemProps>(
  function Item(
    {
      icon,
      active = false,
      disabled = false,
      trailing,
      render,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { collapsed } = useSidebar();

    const itemProps = {
      ref,
      className: clsx(styles.item, className),
      "data-active": active || undefined,
      "data-disabled": disabled || undefined,
      disabled: render ? undefined : disabled,
      "aria-current": active ? ("page" as const) : undefined,
      ...props,
    };

    const content = (
      <>
        {icon && <span className={styles.itemIcon}>{icon}</span>}
        {!collapsed && <span className={styles.itemLabel}>{children}</span>}
        {!collapsed && trailing && (
          <span className={styles.itemTrailing}>{trailing}</span>
        )}
      </>
    );

    if (render) {
      return React.cloneElement(
        render,
        mergeRenderProps(render, itemProps),
        content,
      );
    }

    return (
      <button type="button" {...itemProps}>
        {content}
      </button>
    );
  },
);

export interface ExpandableItemProps
  extends React.ComponentPropsWithoutRef<"div"> {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  submenuVariant?: "border" | "indent";
  render?: React.ReactElement;
}

export const ExpandableItem = React.forwardRef<
  HTMLDivElement,
  ExpandableItemProps
>(function ExpandableItem(
  {
    icon,
    label,
    active = false,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    submenuVariant = "border",
    render,
    className,
    children,
    ...props
  },
  ref,
) {
  const { collapsed } = useSidebar();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const submenuId = React.useId();

  const handleToggle = () => {
    if (disabled || collapsed) return;
    const newOpen = !isOpen;
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const showSubmenu = !collapsed && isOpen;

  const buttonProps = {
    className: styles.item,
    "data-active": active || undefined,
    "data-disabled": disabled || undefined,
    disabled: render ? undefined : disabled,
    onClick: handleToggle,
    "aria-expanded": collapsed ? undefined : isOpen,
    "aria-controls": collapsed ? undefined : submenuId,
  };

  const buttonContent = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      {!collapsed && <span className={styles.itemLabel}>{label}</span>}
      {!collapsed && (
        <span className={styles.chevron} data-open={isOpen}>
          <CentralIcon name="IconChevronDownSmall" size={20} />
        </span>
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={clsx(styles.expandableItem, className)}
      {...props}
    >
      {render ? (
        React.cloneElement(
          render,
          mergeRenderProps(render, buttonProps),
          buttonContent,
        )
      ) : (
        <button type="button" {...buttonProps}>
          {buttonContent}
        </button>
      )}
      {showSubmenu && (
        <div
          id={submenuId}
          className={styles.submenu}
          data-variant={submenuVariant}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
});

export interface SubmenuItemProps
  extends React.ComponentPropsWithoutRef<"button"> {
  icon?: React.ReactNode;
  active?: boolean;
  render?: React.ReactElement;
}

export const SubmenuItem = React.forwardRef<
  HTMLButtonElement,
  SubmenuItemProps
>(function SubmenuItem(
  {
    icon,
    active = false,
    disabled = false,
    render,
    className,
    children,
    ...props
  },
  ref,
) {
  const itemProps = {
    ref,
    className: clsx(styles.submenuItem, className),
    "data-active": active || undefined,
    "data-disabled": disabled || undefined,
    disabled: render ? undefined : disabled,
    "aria-current": active ? ("page" as const) : undefined,
    ...props,
  };

  const content = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
    </>
  );

  if (render) {
    return React.cloneElement(
      render,
      mergeRenderProps(render, itemProps),
      content,
    );
  }

  return (
    <button type="button" {...itemProps}>
      {content}
    </button>
  );
});

export interface DrilldownItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onClick"> {
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onDrilldown?: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  drilldownLabel?: string;
  render?: React.ReactElement;
}

export const DrilldownItem = React.forwardRef<
  HTMLDivElement,
  DrilldownItemProps
>(function DrilldownItem(
  {
    icon,
    active = false,
    disabled = false,
    onDrilldown,
    onClick,
    drilldownLabel,
    render,
    className,
    children,
    ...props
  },
  ref,
) {
  const { collapsed } = useSidebar();

  const buttonProps = {
    className: styles.drilldownMain,
    disabled: render ? undefined : disabled,
    onClick,
    "aria-current": active ? ("page" as const) : undefined,
  };

  const buttonContent = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      {!collapsed && <span className={styles.itemLabel}>{children}</span>}
    </>
  );

  return (
    <div
      ref={ref}
      className={clsx(styles.drilldownItem, className)}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      {...props}
    >
      {render ? (
        React.cloneElement(
          render,
          mergeRenderProps(render, buttonProps),
          buttonContent,
        )
      ) : (
        <button type="button" {...buttonProps}>
          {buttonContent}
        </button>
      )}
      {!collapsed && (
        <button
          type="button"
          className={styles.drilldownButton}
          disabled={disabled}
          onClick={onDrilldown}
          aria-label={drilldownLabel ?? "Navigate"}
        >
          <CentralIcon name="IconChevronRightSmall" size={16} />
        </button>
      )}
    </div>
  );
});

export interface TreeItemProps extends React.ComponentPropsWithoutRef<"div"> {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  render?: React.ReactElement;
}

export const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  function TreeItem(
    {
      icon,
      label,
      active = false,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      render,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { collapsed } = useSidebar();
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const treeId = React.useId();

    const handleToggle = () => {
      if (disabled || collapsed) return;
      const newOpen = !isOpen;
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    const showChildren = !collapsed && isOpen;

    const buttonProps = {
      className: styles.treeItemButton,
      "data-active": active || undefined,
      "data-disabled": disabled || undefined,
      disabled: render ? undefined : disabled,
      onClick: handleToggle,
      "aria-expanded": collapsed ? undefined : isOpen,
      "aria-controls": collapsed ? undefined : treeId,
    };

    const buttonContent = (
      <>
        {!collapsed && (
          <span className={styles.treeChevron} data-open={isOpen}>
            <CentralIcon name="IconChevronRightSmall" size={20} />
          </span>
        )}
        {icon && <span className={styles.itemIcon}>{icon}</span>}
        {!collapsed && <span className={styles.itemLabel}>{label}</span>}
      </>
    );

    return (
      <div ref={ref} className={clsx(styles.treeItem, className)} {...props}>
        {render ? (
          React.cloneElement(
            render,
            mergeRenderProps(render, buttonProps),
            buttonContent,
          )
        ) : (
          <button type="button" {...buttonProps}>
            {buttonContent}
          </button>
        )}
        {showChildren && (
          <div id={treeId} className={styles.treeChildren} role="group">
            {children}
          </div>
        )}
      </div>
    );
  },
);

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"hr"> {}

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <hr
        ref={ref}
        className={clsx(styles.separator, className)}
        role="separator"
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Provider.displayName = "Sidebar.Provider";
  Root.displayName = "Sidebar.Root";
  Trigger.displayName = "Sidebar.Trigger";
  Header.displayName = "Sidebar.Header";
  Content.displayName = "Sidebar.Content";
  Footer.displayName = "Sidebar.Footer";
  Group.displayName = "Sidebar.Group";
  GroupLabel.displayName = "Sidebar.GroupLabel";
  Menu.displayName = "Sidebar.Menu";
  Tree.displayName = "Sidebar.Tree";
  Item.displayName = "Sidebar.Item";
  ExpandableItem.displayName = "Sidebar.ExpandableItem";
  SubmenuItem.displayName = "Sidebar.SubmenuItem";
  DrilldownItem.displayName = "Sidebar.DrilldownItem";
  TreeItem.displayName = "Sidebar.TreeItem";
  Separator.displayName = "Sidebar.Separator";
}
