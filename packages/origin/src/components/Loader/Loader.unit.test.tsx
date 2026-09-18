/**
 * Loader Unit Tests (Vitest + @testing-library/react)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Loader } from "./Loader";

describe("Loader", () => {
  it("renders with role=status and default label", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Loading");
  });

  it("applies a custom label", () => {
    render(<Loader label="Transfer processing" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Transfer processing");
    expect(loader).toHaveTextContent("Transfer processing");
  });

  it("renders three dots by default", () => {
    const { container } = render(<Loader />);
    expect(container.querySelectorAll("div[style]")).toHaveLength(3);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("applies a custom className", () => {
    render(<Loader className="custom-class" />);
    expect(screen.getByRole("status")).toHaveClass("custom-class");
  });

  describe("ring variant", () => {
    it("renders an svg ring instead of dots", () => {
      const { container } = render(<Loader variant="ring" />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(container.querySelectorAll("circle")).toHaveLength(1);
      expect(container.querySelectorAll("path")).toHaveLength(1);
      expect(container.querySelectorAll("div[style]")).toHaveLength(0);
    });

    it("defaults to 24px with a 24x24 viewBox", () => {
      const { container } = render(<Loader variant="ring" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("scales to a custom size while keeping the reference viewBox", () => {
      const { container } = render(<Loader variant="ring" size={12} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "12");
      expect(svg).toHaveAttribute("height", "12");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("keeps the accessibility contract", () => {
      render(<Loader variant="ring" label="Settling" />);
      const loader = screen.getByRole("status");
      expect(loader).toHaveAttribute("aria-label", "Settling");
    });
  });
});
