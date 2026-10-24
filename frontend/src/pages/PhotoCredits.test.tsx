import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { carPhotoManifest } from "../utils/carPhotos";
import { PhotoCreditsPage } from "./PhotoCredits";

describe("PhotoCreditsPage", () => {
  it("renders every manifest entry with safe external links", () => {
    render(
      <MemoryRouter>
        <PhotoCreditsPage />
      </MemoryRouter>,
    );

    for (const photo of carPhotoManifest.photos) {
      expect(screen.getByAltText(photo.title)).toBeTruthy();
    }

    const externalLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("http"));
    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.getAttribute("target")).toBe("_blank");
    }
  });
});
