"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ConfirmDialogState {
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface ConfirmDialogContextType {
  showConfirm: (
    onConfirm: () => void,
    message?: string,
    confirmText?: string,
    cancelText?: string
  ) => void;
  hideConfirm: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(
  undefined
);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [confirm, setConfirm] = useState<ConfirmDialogState | null>(null);

  const showConfirm = (
    onConfirm: () => void,
    message?: string,
    confirmText?: string,
    cancelText?: string
  ) => {
    setConfirm({ onConfirm, message, confirmText, cancelText });
  };

  const hideConfirm = () => {
    setConfirm(null);
  };

  const handleConfirm = () => {
    if (confirm) {
      confirm.onConfirm();
      hideConfirm();
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          onConfirm={handleConfirm}
          onCancel={hideConfirm}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
}
