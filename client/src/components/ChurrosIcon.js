import React from 'react';

const ChurrosIcon = ({ width = 24, height = 24, fill = "#333" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={width}
    height={height}
    fill={fill}
  >
    <g stroke={fill} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 24L32 2 48 24 32 62 16 24Z" />
      <path d="M22 32L32 10 42 32" />
      <path d="M26 36L32 24 38 36" />
    </g>
  </svg>
);

export default ChurrosIcon;
