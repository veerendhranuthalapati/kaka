import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCategoryCoverage,
  assertSafePublicPath,
  buildManifestEntry,
  categoryPhotoFilename,
  htmlToPlainAuthor,
  isJpegBuffer,
  isLicenseAllowed,
  isLicenseAmbiguous,
  isPhotoByteSizeValid,
  parseCommonsCandidates,
  passesCandidateFilters,
  scoreCandidate,
  sha256Hex,
  slugPhotoFilename,
  titleContainsMakeModel,
  vehiclePhotoFilename,
  escapeHtml,
  parsePickOverrides,
  photoAcceptableForDemoVehicle,
  photoMatchesDemoVehicle,
} from "../../scripts/car-photos.lib.js";
import { DEMO_VEHICLE_CATALOG } from "../../scripts/seed-demo.lib.js";

const DEMO_MAKES = [...new Set(DEMO_VEHICLE_CATALOG.map((v) => v.make))];
import type { CommonsSearchPage } from "../../scripts/car-photos.lib.js";

const fixture = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "../fixtures/commons-search-toyota-camry.json"),
    "utf8",
  ),
) as CommonsSearchPage;

describe("car-photos.lib licence rules", () => {
  it("accepts allowed licences and rejects NC/ND/GFDL-only/empty/ambiguous", () => {
    expect(isLicenseAllowed("CC0")).toBe(true);
    expect(isLicenseAllowed("Public domain")).toBe(true);
    expect(isLicenseAllowed("CC BY 4.0")).toBe(true);
    expect(isLicenseAllowed("CC BY-SA 4.0")).toBe(true);
    expect(isLicenseAllowed("")).toBe(false);
    expect(isLicenseAllowed("CC BY-NC 4.0")).toBe(false);
    expect(isLicenseAllowed("CC BY-ND 4.0")).toBe(false);
    expect(isLicenseAllowed("Fair use")).toBe(false);
    expect(isLicenseAllowed("All rights reserved")).toBe(false);
    expect(isLicenseAmbiguous("CC BY 4.0 or CC BY-SA 4.0")).toBe(true);
    expect(isLicenseAllowed("CC BY 4.0 or CC BY-SA 4.0")).toBe(false);
  });
});

describe("car-photos.lib filters and scoring", () => {
  it("matches make and model words in titles", () => {
    expect(titleContainsMakeModel("Toyota Camry 2020.jpg", "Toyota", "Camry")).toBe(
      true,
    );
    expect(titleContainsMakeModel("Honda Civic front", "Toyota", "Camry")).toBe(false);
  });

  it("scores candidates with licence preference", () => {
    expect(
      scoreCandidate({ licenseShortName: "CC0", width: 1400, title: "front view" }),
    ).toBeGreaterThan(
      scoreCandidate({ licenseShortName: "CC BY-SA 4.0", width: 1400, title: "side" }),
    );
  });

  it("applies mime, size, aspect and keyword filters", () => {
    expect(
      passesCandidateFilters({
        mime: "image/jpeg",
        width: 1600,
        height: 900,
        title: "Toyota Camry front",
        licenseShortName: "CC BY 4.0",
        artistHtml: "<a>John Doe</a>",
      }),
    ).toBe(true);
    expect(
      passesCandidateFilters({
        mime: "image/png",
        width: 1600,
        height: 900,
        title: "Toyota Camry",
        licenseShortName: "CC BY 4.0",
        artistHtml: "Author",
      }),
    ).toBe(false);
    expect(
      passesCandidateFilters({
        mime: "image/jpeg",
        width: 1600,
        height: 900,
        title: "Toyota interior dash",
        licenseShortName: "CC BY 4.0",
        artistHtml: "Author",
      }),
    ).toBe(false);
  });
});

describe("car-photos.lib slugs and author text", () => {
  it("slugifies to safe filenames only", () => {
    expect(slugPhotoFilename("Mercedes-Benz C 300")).toBe("mercedes-benz-c-300");
    expect(vehiclePhotoFilename("Toyota", "Camry")).toBe("toyota-camry.jpg");
    expect(categoryPhotoFilename("SUV", 2)).toBe("suv-2.jpg");
    expect(() => assertSafePublicPath("../evil.jpg")).toThrow();
    expect(() => assertSafePublicPath("toyota-camry.jpg")).not.toThrow();
  });

  it("strips HTML from artist metadata", () => {
    expect(htmlToPlainAuthor('<a href="/x">Jane</a> &amp; Co')).toBe("Jane & Co");
    expect(htmlToPlainAuthor("<script>x</script>Safe Author")).toBe("Safe Author");
    expect(htmlToPlainAuthor("A".repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

describe("car-photos.lib manifest and bytes", () => {
  it("builds manifest entries with plain-text authors", () => {
    const entry = buildManifestEntry({
      file: "toyota-camry.jpg",
      category: "Sedan",
      make: "Toyota",
      model: "Camry",
      width: 1280,
      height: 720,
      title: "Toyota Camry",
      authorHtml: "<b>Photographer</b>",
      licenseShortName: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      descriptionUrl: "https://commons.wikimedia.org/wiki/File:Example",
      sourceUrl: "https://upload.wikimedia.org/example.jpg",
    });
    expect(entry.author).toBe("Photographer");
    expect(entry.resized).toBe(true);
  });

  it("validates jpeg magic bytes and size window", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    expect(isJpegBuffer(jpeg)).toBe(true);
    expect(isPhotoByteSizeValid(50 * 1024)).toBe(true);
    expect(isPhotoByteSizeValid(10 * 1024)).toBe(false);
    expect(sha256Hex(jpeg)).toHaveLength(64);
  });

  it("parses commons fixture pages", () => {
    const candidates = parseCommonsCandidates(fixture);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]?.title.length).toBeGreaterThan(0);
  });

  it("enforces per-category photo counts", () => {
    const manifest = {
      photos: [
        buildManifestEntry({
          file: "sedan-1.jpg",
          category: "Sedan",
          width: 1280,
          height: 800,
          title: "Sedan",
          authorHtml: "A",
          licenseShortName: "CC0",
          licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
          descriptionUrl: "https://commons.wikimedia.org/wiki/File:Sedan",
          sourceUrl: "https://upload.wikimedia.org/sedan.jpg",
        }),
        buildManifestEntry({
          file: "sedan-2.jpg",
          category: "Sedan",
          width: 1280,
          height: 800,
          title: "Sedan 2",
          authorHtml: "B",
          licenseShortName: "CC0",
          licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
          descriptionUrl: "https://commons.wikimedia.org/wiki/File:Sedan2",
          sourceUrl: "https://upload.wikimedia.org/sedan2.jpg",
        }),
      ],
    };
    expect(() => assertCategoryCoverage(manifest, ["Sedan"])).not.toThrow();
    expect(() => assertCategoryCoverage(manifest, ["SUV"])).toThrow();
  });
});

describe("car-photos.lib demo vehicle matching", () => {
  it("rejects Honda SUV category filler for Skoda Octavia Combi", () => {
    const title =
      "File:2014 Honda Pilot wagon, front side view 03.jpg";
    const categories = ["Honda Pilot", "SUVs"];
    expect(
      photoMatchesDemoVehicle(title, categories, "Skoda", "Octavia Combi", DEMO_MAKES),
    ).toBe(false);
    expect(
      photoAcceptableForDemoVehicle({
        title,
        categories,
        make: "Skoda",
        model: "Octavia Combi",
        vehicleCategory: "Wagon",
        demoMakes: DEMO_MAKES,
      }),
    ).toBe(false);
  });

  it("rejects BMW 5-Series title for BMW 3 Series (no spurious digit match)", () => {
    const title =
      "File:BMW 5-Series E39 Sedan (Toronto Spring '12 Classic Car Auction).jpg";
    expect(
      photoMatchesDemoVehicle(title, [], "BMW", "3 Series", DEMO_MAKES),
    ).toBe(false);
  });

  it("accepts when make and model appear and no other demo make intrudes", () => {
    const title = "File:2020 Skoda Octavia Combi SE L.jpg";
    expect(
      photoAcceptableForDemoVehicle({
        title,
        categories: ["Škoda Octavia"],
        make: "Skoda",
        model: "Octavia Combi",
        vehicleCategory: "Wagon",
        demoMakes: DEMO_MAKES,
      }),
    ).toBe(true);
  });
});

describe("car-photos.lib review helpers", () => {
  it("escapes HTML for generated review pages", () => {
    expect(escapeHtml(`a & b <script>"x"`)).toBe(
      "a &amp; b &lt;script&gt;&quot;x&quot;",
    );
  });

  it("parses --pick slug=index overrides", () => {
    expect(
      parsePickOverrides(["--pick=toyota-camry=2", "--pick=ford-f-150=4"]),
    ).toEqual({ "toyota-camry": 2, "ford-f-150": 4 });
    expect(() => parsePickOverrides(["--pick=bad=9"])).toThrow();
  });
});
