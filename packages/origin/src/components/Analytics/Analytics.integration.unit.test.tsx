import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { AnalyticsProvider } from "./AnalyticsContext";
import type { AnalyticsHandler, InteractionInfo } from "./AnalyticsContext";
import { Button } from "../Button/Button";
import { Switch } from "../Switch/Switch";

function createHandler() {
  const calls: InteractionInfo[] = [];
  const handler: AnalyticsHandler = {
    onInteraction: vi.fn((info: InteractionInfo) => {
      calls.push(info);
    }),
  };
  return { handler, calls };
}

function Wrapper({
  handler,
  children,
}: {
  handler: AnalyticsHandler;
  children: React.ReactNode;
}) {
  return <AnalyticsProvider value={handler}>{children}</AnalyticsProvider>;
}

describe("Analytics integration", () => {
  let handler: AnalyticsHandler;
  let calls: InteractionInfo[];

  beforeEach(() => {
    const h = createHandler();
    handler = h.handler;
    calls = h.calls;
  });

  describe("Button", () => {
    it("emits click interaction when analyticsName is set", () => {
      const onClick = vi.fn();
      const { getByRole } = render(
        <Wrapper handler={handler}>
          <Button analyticsName="save-btn" onClick={onClick}>
            Save
          </Button>
        </Wrapper>,
      );

      fireEvent.click(getByRole("button"));
      expect(calls).toHaveLength(1);
      expect(calls[0]).toEqual({
        name: "save-btn",
        component: "Button",
        interaction: "click",
        metadata: undefined,
      });
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not emit when analyticsName is omitted", () => {
      const { getByRole } = render(
        <Wrapper handler={handler}>
          <Button>Save</Button>
        </Wrapper>,
      );

      fireEvent.click(getByRole("button"));
      expect(calls).toHaveLength(0);
    });

    it("does not emit without provider", () => {
      const { getByRole } = render(
        <Button analyticsName="save-btn">Save</Button>,
      );

      fireEvent.click(getByRole("button"));
      expect(handler.onInteraction).not.toHaveBeenCalled();
    });
  });

  describe("Switch", () => {
    it("emits change interaction with checked metadata", () => {
      const onChange = vi.fn();
      const { getByRole } = render(
        <Wrapper handler={handler}>
          <Switch analyticsName="dark-mode" onCheckedChange={onChange} />
        </Wrapper>,
      );

      fireEvent.click(getByRole("switch"));
      expect(calls).toHaveLength(1);
      expect(calls[0].name).toBe("dark-mode");
      expect(calls[0].component).toBe("Switch");
      expect(calls[0].interaction).toBe("change");
      expect(calls[0].metadata).toHaveProperty("checked");
    });
  });
});
