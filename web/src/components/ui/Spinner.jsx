import React from "react";

const Spinner = ({
  size = 20,
  color = "var(--color-primary-600)",
  className = "",
}) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
        strokeOpacity="0.25"
      />
      <path d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z" fill={color} />
    </svg>
  );
};

export default Spinner;
