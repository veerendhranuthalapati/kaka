import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageRouteSkeleton } from "./PageRouteSkeleton";

describe("PageRouteSkeleton", () => {
  it("renders a main landmark with skeleton placeholders", () => {
    render(<PageRouteSkeleton />);
    expect(screen.getByRole("main")).toBeTruthy();
  });
});
