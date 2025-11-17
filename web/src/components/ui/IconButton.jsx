import React from "react";
import Icon from "./Icon";

const IconButton = ({
  name,
  onClick,
  label,
  className = "",
  size = 18,
  variant = "ghost",
}) => {
  const base = "btn-base";
  const variants = {
    ghost: `${base} bg-transparent hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]`,
    primary: `${base} btn-primary`,
    danger: `${base} bg-red-600 text-white hover:bg-red-500`,
  };
  return (
    <button
      type="button"
      aria-label={label || name}
      onClick={onClick}
      className={`${variants[variant] || variants.ghost} ${className}`}
    >
      <Icon name={name} size={size} />
    </button>
  );
};

export default IconButton;
