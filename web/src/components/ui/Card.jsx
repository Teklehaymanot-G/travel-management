import React from "react";

const Card = ({ title, actions, children, className = "" }) => {
  return (
    <div
      className={`card-base relative overflow-hidden ${className}`}
      role="group"
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 className="text-sm font-semibold tracking-wide text-[var(--color-neutral-700)]">
              {title}
            </h3>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
