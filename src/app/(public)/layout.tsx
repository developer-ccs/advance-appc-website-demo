import React from "react";
import ClientLayout from "../../components/layout/app-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
