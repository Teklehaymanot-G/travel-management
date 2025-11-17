import React, { useEffect } from "react";

const Modal = ({ open, onClose, title, children, actions }) => {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[40] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose?.()}
        aria-hidden
      />
      <div className="relative z-[41] w-full max-w-lg card-base">
        {title && (
          <div className="mb-3 pb-2 border-b border-[var(--color-neutral-200)]">
            <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">
              {title}
            </h3>
          </div>
        )}
        <div>{children}</div>
        {actions && (
          <div className="mt-4 flex justify-end gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
