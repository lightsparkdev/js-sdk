import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Form } from "./Form";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

const meta = {
  title: "Components/Form",
  component: Form,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Form>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="Enter your email" />
        <Field.Description>We'll never share your email.</Field.Description>
      </Field.Root>
      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Input type="password" placeholder="Enter your password" />
      </Field.Root>
      <Button type="submit">Sign In</Button>
    </Form>
  ),
};

export const WithValidation: Story = {
  render: function WithValidationStory() {
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const newErrors: Record<string, string> = {};
      if (!email) newErrors.email = "Email is required";
      if (!password) newErrors.password = "Password is required";
      if (password && password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setSubmitted(true);
      }
    };

    if (submitted) {
      return <p>Form submitted successfully!</p>;
    }

    return (
      <Form onSubmit={handleSubmit} errors={errors}>
        <Field.Root name="email" invalid={!!errors.email}>
          <Field.Label>Email</Field.Label>
          <Input type="email" placeholder="Enter your email" />
          <Field.Error>{errors.email}</Field.Error>
        </Field.Root>
        <Field.Root name="password" invalid={!!errors.password}>
          <Field.Label>Password</Field.Label>
          <Input type="password" placeholder="Enter your password" />
          <Field.Error>{errors.password}</Field.Error>
        </Field.Root>
        <Button type="submit">Sign In</Button>
      </Form>
    );
  },
};

export const ContactForm: Story = {
  render: () => (
    <Form>
      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Input placeholder="Your name" />
      </Field.Root>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="your@email.com" />
      </Field.Root>
      <Field.Root name="message">
        <Field.Label>Message</Field.Label>
        <Input placeholder="Your message" />
        <Field.Description>
          We'll get back to you within 24 hours.
        </Field.Description>
      </Field.Root>
      <Button type="submit">Send Message</Button>
    </Form>
  ),
};
