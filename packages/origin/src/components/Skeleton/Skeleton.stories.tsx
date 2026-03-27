import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    style: { control: "object" },
    className: { control: "text" },
  },
};

export default meta;

export const Default: StoryObj<typeof Skeleton> = {
  args: {
    style: { width: 200, height: 20 },
  },
};

export const Avatar: StoryObj = {
  render: () => (
    <Skeleton.Group>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
        }}
      >
        <Skeleton
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--corner-radius-round)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-2xs)",
          }}
        >
          <Skeleton style={{ width: 150, height: 16 }} />
          <Skeleton style={{ width: 100, height: 16 }} />
        </div>
      </div>
    </Skeleton.Group>
  ),
};

export const Card: StoryObj = {
  render: () => (
    <Skeleton.Group>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
          width: 300,
          padding: "var(--spacing-md)",
          borderRadius: "var(--corner-radius-md)",
          border: "var(--stroke-xs) solid var(--border-primary)",
        }}
      >
        <Skeleton style={{ width: "100%", aspectRatio: "16 / 9" }} />
        <Skeleton style={{ width: "75%", height: 16 }} />
        <Skeleton style={{ width: "50%", height: 16 }} />
      </div>
    </Skeleton.Group>
  ),
};

export const Text: StoryObj = {
  render: () => (
    <Skeleton.Group>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-2xs)",
          maxWidth: 320,
        }}
      >
        <Skeleton style={{ width: "100%", height: 16 }} />
        <Skeleton style={{ width: "100%", height: 16 }} />
        <Skeleton style={{ width: "75%", height: 16 }} />
      </div>
    </Skeleton.Group>
  ),
};

export const Table: StoryObj = {
  render: () => (
    <Skeleton.Group>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)",
          width: 400,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Skeleton style={{ flex: 1, height: 16 }} />
            <Skeleton style={{ width: 80, height: 16 }} />
            <Skeleton style={{ width: 60, height: 16 }} />
          </div>
        ))}
      </div>
    </Skeleton.Group>
  ),
};

export const OnDarkSurface: StoryObj = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: "var(--surface-primary)",
        borderRadius: "var(--corner-radius-md)",
        padding: "var(--spacing-md)",
      }}
    >
      <Skeleton.Group>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          <Skeleton
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--corner-radius-round)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2xs)",
            }}
          >
            <Skeleton style={{ width: 150, height: 16 }} />
            <Skeleton style={{ width: 100, height: 16 }} />
          </div>
        </div>
      </Skeleton.Group>
    </div>
  ),
};

export const Form: StoryObj = {
  render: () => (
    <Skeleton.Group>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-lg)",
          width: 280,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-2xs)",
          }}
        >
          <Skeleton style={{ width: 80, height: 14 }} />
          <Skeleton style={{ width: "100%", height: 36 }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-2xs)",
          }}
        >
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: "100%", height: 36 }} />
        </div>
        <Skeleton style={{ width: 80, height: 36 }} />
      </div>
    </Skeleton.Group>
  ),
};
