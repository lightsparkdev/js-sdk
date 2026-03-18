"use client";

import * as React from "react";
import { Form as BaseForm } from "@base-ui/react/form";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Form.module.scss";

export interface FormProps extends BaseForm.Props {
  analyticsName?: string;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  function Form(props, ref) {
    const { className, analyticsName, onSubmit, ...other } = props;
    const trackedSubmit = useTrackedCallback(
      analyticsName,
      "Form",
      "submit",
      onSubmit,
    );

    return (
      <BaseForm
        ref={ref}
        className={clsx(styles.form, className)}
        onSubmit={trackedSubmit}
        {...other}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}

export default Form;
