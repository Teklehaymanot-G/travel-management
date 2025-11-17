import React from "react";

const Input = ({
  label,
  hint,
  error,
  className = "",
  prefix,
  suffix,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wide text-[var(--color-neutral-600)]">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-[var(--radius-md)] border border-[var(--color-neutral-300)] bg-white focus-within:border-[var(--color-primary-500)] focus-within:shadow-focus transition-colors`}
      >
        {prefix && (
          <div className="pl-3 text-[var(--color-neutral-500)] flex items-center">
            {prefix}
          </div>
        )}
        <input
          className="input-base bg-transparent border-none focus:outline-none flex-1"
          {...props}
        />
        {suffix && (
          <div className="pr-3 text-[var(--color-neutral-500)] flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {hint && !error && (
        <div className="text-[10px] text-[var(--color-neutral-500)]">
          {hint}
        </div>
      )}
      {error && (
        <div className="text-[10px] text-[var(--color-danger-600)] font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
