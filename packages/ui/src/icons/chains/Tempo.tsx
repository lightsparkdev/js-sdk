export function Tempo({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 1024 1024"
    >
      <circle cx="512" cy="512" r="512" fill="#000000" />
      <path
        transform="translate(324.797 306.519) scale(0.562799)"
        fill="#fff"
        d="M258 750 447 170H677L730 0H53L0 170H243L53 750Z"
      />
    </svg>
  );
}
