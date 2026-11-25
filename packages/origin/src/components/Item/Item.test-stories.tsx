"use client";

import * as React from "react";
import { Link, MemoryRouter } from "react-router-dom";
import { Item } from "./Item";
import { Badge } from "@/components/Badge";
import { CentralIcon } from "@/components/Icon";

const ComposedLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(function ComposedLink(props, ref) {
  return <a ref={ref} {...props} />;
});

// Basic rendering
export function BasicItem() {
  return <Item title="Settings" />;
}

export function ItemWithDescription() {
  return <Item title="Dark mode" description="Use system setting" />;
}

export function ItemWithLabel() {
  return (
    <Item
      title="Jane Doe"
      description="jane@example.com"
      label={<Badge>Admin</Badge>}
    />
  );
}

// Slots
export function ItemWithLeading() {
  return (
    <Item
      title="Settings"
      leading={<CentralIcon name="IconSettingsGear1" size={24} />}
    />
  );
}

export function ItemWithTrailing() {
  return (
    <Item
      title="Settings"
      trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
    />
  );
}

export function DisclosureItem() {
  return <Item title="Account settings" disclosure />;
}

export function ItemWithBothSlots() {
  return (
    <Item
      title="Settings"
      description="Manage your preferences"
      leading={<CentralIcon name="IconSettingsGear1" size={24} />}
      trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
    />
  );
}

// Sizes
export function CompactItem() {
  return (
    <Item title="Payment received" description="2 minutes ago" size="compact" />
  );
}

export function DefaultSizeItem() {
  return <Item title="Payment received" description="2 minutes ago" />;
}

export function CompactItemWithLabel() {
  return (
    <Item
      title="Jane Doe"
      description="jane@example.com"
      label={<Badge>Admin</Badge>}
      size="compact"
    />
  );
}

export function CompactItemAsLink() {
  return (
    <Item
      title="Payment received"
      description="2 minutes ago"
      size="compact"
      render={<a href="#details" />}
    />
  );
}

// Clickable behavior
export function ClickableItem() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <Item
      title={clicked ? "Clicked!" : "Click me"}
      onClick={() => setClicked(true)}
    />
  );
}

export function NonClickableItem() {
  return <Item title="Static item" clickable={false} />;
}

// States
export function SelectedItem() {
  return (
    <Item
      title="Selected option"
      selected
      trailing={<CentralIcon name="IconCheckmark2Small" size={24} />}
    />
  );
}

export function DisabledItem() {
  return <Item title="Disabled item" disabled />;
}

export function DisabledClickableItem() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <Item
      title={clicked ? "Should not change" : "Disabled clickable"}
      disabled
      onClick={() => setClicked(true)}
    />
  );
}

// Custom render
export function ItemAsButton() {
  return (
    <Item
      title="Button item"
      render={<button type="button" />}
      onClick={() => {}}
    />
  );
}

export function InteractiveItemAsButton() {
  const [activations, setActivations] = React.useState(0);
  const [renderActivations, setRenderActivations] = React.useState(0);

  return (
    <>
      <Item
        title="Choose option"
        description="Continue with this longer option description that remains readable"
        wrapDescription
        disclosure
        render={
          <button
            type="button"
            onClick={() => setRenderActivations((count) => count + 1)}
          />
        }
        onClick={() => setActivations((count) => count + 1)}
      />
      <output data-testid="item-activations">{activations}</output>
      <output data-testid="render-activations">{renderActivations}</output>
    </>
  );
}

export function InteractiveItemAsLink() {
  const [activations, setActivations] = React.useState(0);

  return (
    <>
      <Item
        title="View details"
        render={<a href="#details" />}
        onClick={() => setActivations((count) => count + 1)}
      />
      <output data-testid="link-activations">{activations}</output>
      <div id="details">Details</div>
    </>
  );
}

export function InteractiveItemAsSummary() {
  const [itemActivations, setItemActivations] = React.useState(0);
  const [renderActivations, setRenderActivations] = React.useState(0);

  return (
    <>
      <details>
        <Item
          title="View summary details"
          render={
            <summary
              onClick={() => setRenderActivations((count) => count + 1)}
            />
          }
          onClick={() => setItemActivations((count) => count + 1)}
        />
        <div>Summary details</div>
      </details>
      <output data-testid="summary-item-activations">{itemActivations}</output>
      <output data-testid="summary-render-activations">
        {renderActivations}
      </output>
    </>
  );
}

export function InteractiveItemAsComposedLink() {
  const [itemActivations, setItemActivations] = React.useState(0);
  const [renderActivations, setRenderActivations] = React.useState(0);

  return (
    <>
      <Item
        title="View composed details"
        render={
          <ComposedLink
            href="#composed-details"
            onClick={() => setRenderActivations((count) => count + 1)}
          />
        }
        onClick={() => setItemActivations((count) => count + 1)}
      />
      <output data-testid="composed-item-activations">{itemActivations}</output>
      <output data-testid="composed-render-activations">
        {renderActivations}
      </output>
      <div id="composed-details">Composed details</div>
    </>
  );
}

export function DisabledItemAsComposedLink() {
  const [itemActivations, setItemActivations] = React.useState(0);
  const [renderActivations, setRenderActivations] = React.useState(0);

  return (
    <>
      <Item
        title="Disabled composed details"
        disabled
        render={
          <ComposedLink
            data-testid="disabled-composed-link"
            href="#disabled-composed-details"
            onClick={() => setRenderActivations((count) => count + 1)}
          />
        }
        onClick={() => setItemActivations((count) => count + 1)}
      />
      <output data-testid="disabled-item-activations">{itemActivations}</output>
      <output data-testid="disabled-render-activations">
        {renderActivations}
      </output>
      <div id="disabled-composed-details">Disabled composed details</div>
    </>
  );
}

export function DisabledItemAsRoutedLink() {
  const [itemActivations, setItemActivations] = React.useState(0);
  const [renderActivations, setRenderActivations] = React.useState(0);

  return (
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Item
        title="Disabled routed details"
        disabled
        render={
          <Link
            data-testid="disabled-routed-link"
            to="/example"
            onClick={() => setRenderActivations((count) => count + 1)}
          />
        }
        onClick={() => setItemActivations((count) => count + 1)}
      />
      <output data-testid="disabled-routed-item-activations">
        {itemActivations}
      </output>
      <output data-testid="disabled-routed-render-activations">
        {renderActivations}
      </output>
    </MemoryRouter>
  );
}

export function ItemAsListItem() {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      <Item title="List item" render={<li />} />
    </ul>
  );
}

// Navigation example
export function NavigationItem() {
  return (
    <Item
      title="Account settings"
      description="Manage your account"
      leading={<CentralIcon name="IconHome" size={24} />}
      disclosure
      onClick={() => {}}
    />
  );
}

// Selectable list
export function SelectableItems() {
  const [selected, setSelected] = React.useState<string>("item-1");
  return (
    <div>
      <Item
        title="Option 1"
        selected={selected === "item-1"}
        onClick={() => setSelected("item-1")}
        trailing={
          selected === "item-1" ? (
            <CentralIcon name="IconCheckmark2Small" size={24} />
          ) : undefined
        }
      />
      <Item
        title="Option 2"
        selected={selected === "item-2"}
        onClick={() => setSelected("item-2")}
        trailing={
          selected === "item-2" ? (
            <CentralIcon name="IconCheckmark2Small" size={24} />
          ) : undefined
        }
      />
    </div>
  );
}
