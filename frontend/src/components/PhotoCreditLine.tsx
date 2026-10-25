import { safeHref } from "../security/safeUrl";
import type { CarPhotoEntry } from "../utils/carPhotos";

export function PhotoCreditLine({ entry }: { entry: CarPhotoEntry }) {
  const licenseHref = safeHref(entry.licenseUrl);
  const descriptionHref = safeHref(entry.descriptionUrl);
  return (
    <p className="text-sm text-muted">
      Photo: {entry.title} / {entry.author} /{" "}
      {licenseHref ? (
        <a
          className="link"
          href={licenseHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          {entry.licenseShortName}
        </a>
      ) : (
        <span>{entry.licenseShortName}</span>
      )}{" "}
      /{" "}
      {descriptionHref ? (
        <a
          className="link"
          href={descriptionHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          Wikimedia Commons
        </a>
      ) : (
        <span>Wikimedia Commons</span>
      )}
    </p>
  );
}
