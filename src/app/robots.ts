export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/applicant", "/applicant/"],
    },
    sitemap: "https://appharmacycouncil.com/sitemap.xml",
  };
}
