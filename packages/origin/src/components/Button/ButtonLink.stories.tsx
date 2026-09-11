import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ButtonLink } from "./Button";

type RouterLikeLinkProps = Omit<React.ComponentPropsWithoutRef<"a">, "href"> & {
  to: string;
};

const RouterLikeLink = React.forwardRef<HTMLAnchorElement, RouterLikeLinkProps>(
  function RouterLikeLink({ to, ...props }, ref) {
    return <a ref={ref} href={to} data-router-like-link="" {...props} />;
  },
);

const meta: Meta<typeof ButtonLink> = {
  title: "Components/ButtonLink",
  component: ButtonLink,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["filled", "secondary", "outline", "ghost", "critical", "link"],
    },
    size: {
      control: "radio",
      options: ["default", "compact", "dense"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    children: { control: "text" },
    href: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonLink>;

export const Default: Story = {
  args: {
    href: "/docs",
    variant: "filled",
    size: "default",
    children: "Read docs",
  },
};

export const Outline: Story = {
  args: {
    href: "/settings",
    variant: "outline",
    children: "Open settings",
  },
};

export const Compact: Story = {
  args: {
    href: "/customers",
    variant: "secondary",
    size: "compact",
    children: "View customers",
  },
};

export const RenderComposition: Story = {
  render: () => (
    <ButtonLink
      render={<RouterLikeLink to="/router-destination" />}
      variant="outline"
    >
      Router-like link
    </ButtonLink>
  ),
};
