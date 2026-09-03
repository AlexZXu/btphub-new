"use client";

import { CloseIcon } from "@/components/icons";

export default function Modal({
  title,
  onClose,
  width = 640,
  children,
}: {
  title?: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        {title ? <div className="modal-title">{title}</div> : null}
        {children}
      </div>
    </div>
  );
}
