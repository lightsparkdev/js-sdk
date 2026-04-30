import { useId } from "react";

export function Solana({ size = 24 }: { size?: number }) {
  const uid = useId();
  const a = `solana__a-${uid}`;
  const b = `solana__b-${uid}`;
  const c = `solana__c-${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill={`url(#${a})`}
        d="M18.413 7.902a.62.62 0 0 1-.411.163H3.58c-.512 0-.77-.585-.416-.928l2.369-2.284a.6.6 0 0 1 .41-.169H20.42c.517 0 .77.59.41.935z"
      />
      <path
        fill={`url(#${b})`}
        d="M18.413 19.158a.62.62 0 0 1-.411.158H3.58c-.512 0-.77-.58-.416-.923l2.369-2.29a.6.6 0 0 1 .41-.163H20.42c.517 0 .77.586.41.928z"
      />
      <path
        fill={`url(#${c})`}
        d="M18.413 10.473a.62.62 0 0 0-.411-.158H3.58c-.512 0-.77.58-.416.923l2.369 2.29c.111.103.257.16.41.163H20.42c.517 0 .77-.586.41-.928z"
      />
      <defs>
        <linearGradient
          id={a}
          x1="3.001"
          x2="21.459"
          y1="55.041"
          y2="54.871"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#599DB0" />
          <stop offset="1" stopColor="#47F8C3" />
        </linearGradient>
        <linearGradient
          id={b}
          x1="3.001"
          x2="21.341"
          y1="9.168"
          y2="9.027"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C44FE2" />
          <stop offset="1" stopColor="#73B0D0" />
        </linearGradient>
        <linearGradient
          id={c}
          x1="4.036"
          x2="20.303"
          y1="12.003"
          y2="12.003"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#778CBF" />
          <stop offset="1" stopColor="#5DCDC9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
