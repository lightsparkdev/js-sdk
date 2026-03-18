import type { Meta, StoryObj } from "@storybook/react";
import { PreviewCard } from "./index";

const meta: Meta = {
  title: "Components/PreviewCard",
  component: PreviewCard.Root,
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: "4rem" }}>
      <PreviewCard.Root>
        <PreviewCard.Trigger href="https://example.com">
          Hover to preview
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner sideOffset={8}>
            <PreviewCard.Popup style={{ padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0 }}>
                A lightweight preview of the linked page
              </p>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </div>
  ),
};

export const WithArrow: StoryObj = {
  render: () => (
    <div style={{ padding: "4rem" }}>
      <PreviewCard.Root>
        <PreviewCard.Trigger href="https://example.com">
          Hover to preview
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner sideOffset={8}>
            <PreviewCard.Popup style={{ padding: "var(--spacing-md)" }}>
              <PreviewCard.Arrow />
              <p style={{ margin: 0 }}>Preview with an arrow pointer</p>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </div>
  ),
};

export const RichContent: StoryObj = {
  render: () => (
    <div style={{ padding: "4rem" }}>
      <PreviewCard.Root>
        <PreviewCard.Trigger href="https://example.com">
          Typography docs
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner sideOffset={8}>
            <PreviewCard.Popup>
              <img
                src="https://placehold.co/320x160"
                alt=""
                style={{ width: "100%", display: "block" }}
              />
              <div style={{ padding: "var(--spacing-md)" }}>
                <p style={{ margin: "0 0 var(--spacing-xs)" }}>
                  <strong>Typography</strong>
                </p>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Learn about text styles, mixins, and scale
                </p>
              </div>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </div>
  ),
};

export const DefaultOpen: StoryObj = {
  render: () => (
    <div style={{ padding: "4rem" }}>
      <PreviewCard.Root defaultOpen>
        <PreviewCard.Trigger href="https://example.com">
          Always visible preview
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner sideOffset={8}>
            <PreviewCard.Popup style={{ padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0 }}>This preview starts open</p>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </div>
  ),
};
