import React from "react";

const variantClass = {
  neutral: "badge-base",
  success: "badge-base badge-success",
  danger: "badge-base badge-danger",
  warning: "badge-base badge-warning",
  info: "badge-base badge-info",
};

const Badge = ({ children, variant = "neutral", className = "" }) => {
  return (
    <span
      className={`${
        variantClass[variant] || variantClass.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
