import { Link } from "react-router-dom";
import { carPhotoManifest } from "../utils/carPhotos";

export function PhotoCreditsPage() {
  return (
    <main className="shell py-10">
      <h1 className="font-display text-section-title">Photo credits</h1>
      <p className="mt-2 max-w-2xl text-body text-muted">
        Images are from Wikimedia Commons, resized for web display. They may
        depict a different model year than the sample vehicle specifications.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {carPhotoManifest.photos.map((photo) => (
          <li key={photo.file} className="surface overflow-hidden">
            <img
              src={`/cars/${photo.file}`}
              alt={photo.title}
              className="aspect-[16/9] w-full object-cover"
              loading="lazy"
              decoding="async"
              width={photo.width}
              height={photo.height}
            />
            <div className="space-y-2 p-4 text-sm">
              <p className="font-medium text-ink">{photo.title.replace(/^File:/, "")}</p>
              <p className="text-muted">Author: {photo.author}</p>
              <p>
                <a
                  className="link"
                  href={photo.licenseUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {photo.licenseShortName}
                </a>
              </p>
              <p>
                <a
                  className="link"
                  href={photo.descriptionUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Source on Commons
                </a>
              </p>
              <p className="text-label text-muted">Resized for web</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link className="link" to="/login">Back to sign in</Link>
      </p>
    </main>
  );
}
