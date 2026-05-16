"use client";

import { ReactNode } from "react";
import { ToastProvider } from "./ToastContext";
import { ConfirmDialogProvider } from "./ConfirmDialogContext";

export function UIProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        {children}
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
