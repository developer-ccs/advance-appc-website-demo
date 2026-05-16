import Image from "next/image";
import mapPreview from "@/../public/images/map-preview.png";

export default function FooterMap() {
  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Directorate+of+Health+Services+Naharlagun+Arunachal+Pradesh";

  return (
    <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/20 bg-white relative">
      <Image
        src={mapPreview}
        alt="Office location map preview"
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover"
        priority
      />

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Centered Get Directions button only */}
      <div className="absolute inset-0 flex items-center justify-center">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions"
          className="flex items-center gap-2 bg-white text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Get Directions
        </a>
      </div>
    </div>
  );
}
