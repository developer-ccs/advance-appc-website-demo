// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: "https://appharmacycouncil.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://appharmacycouncil.com/notices",
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: "https://appharmacycouncil.com/tenders-list",
      lastModified: new Date(),
      priority: 0.5,
    },
  ];
}
