"use client";

import * as React from "react";
import { Form } from "./Form";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export function BasicForm() {
  return (
    <Form>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="Enter email" />
        <Field.Description>We'll never share your email.</Field.Description>
      </Field.Root>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

export function FormWithMultipleFields() {
  return (
    <Form>
      <Field.Root name="firstName">
        <Field.Label>First Name</Field.Label>
        <Input placeholder="First name" />
      </Field.Root>
      <Field.Root name="lastName">
        <Field.Label>Last Name</Field.Label>
        <Input placeholder="Last name" />
      </Field.Root>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="Email" />
      </Field.Root>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

export function FormWithValidation() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (
    values: Record<string, FormDataEntryValue>,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    const email = values.email as string;
    if (!email || !email.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      event.preventDefault();
    } else {
      setErrors({});
    }
  };

  return (
    <Form onSubmit={handleSubmit} errors={errors}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="Enter email" required />
        <Field.Error>Please enter a valid email address</Field.Error>
      </Field.Root>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

export function FormWithServerErrors() {
  const serverErrors = {
    email: "This email is already registered",
  };

  return (
    <Form errors={serverErrors}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input
          type="email"
          placeholder="Enter email"
          defaultValue="test@example.com"
        />
        <Field.Error>This email is already registered</Field.Error>
      </Field.Root>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
