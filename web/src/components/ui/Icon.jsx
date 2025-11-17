import React from "react";

const paths = {
  home: (
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  user: (
    <path d="M5.121 17.804A7 7 0 1118.879 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  ),
  logout: (
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
  ),
  bell: (
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  search: <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />,
};

const Icon = ({
  name,
  size = 20,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    {paths[name] || paths.menu}
  </svg>
);

export default Icon;
