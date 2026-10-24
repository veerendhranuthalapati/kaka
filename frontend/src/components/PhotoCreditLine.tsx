import type { CarPhotoEntry } from "../utils/carPhotos";

export function PhotoCreditLine({ entry }: { entry: CarPhotoEntry }) {
  return (
    <p className="text-sm text-muted">
      Photo: {entry.author} /{" "}
      <a
        className="link"
        href={entry.licenseUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {entry.licenseShortName}
      </a>{" "}
      /{" "}
      <a
        className="link"
        href={entry.descriptionUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Wikimedia Commons
      </a>
    </p>
  );
}
