const Button = ({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const variants = {
    primary: "btn-base btn-primary",
    secondary:
      "btn-base btn-outline-none bg-white hover:bg-gray-100 text-gray-700 border border-gray-300",
    danger:
      "btn-base bg-red-600 hover:bg-red-500 text-white focus:outline-none focus:ring-2 focus:ring-red-400",
    warning:
      "btn-base bg-amber-500 hover:bg-amber-400 text-white focus:outline-none focus:ring-2 focus:ring-amber-300",
    ghost:
      "btn-base bg-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant] || variants.primary}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
