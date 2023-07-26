// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type Props = {
  size?: 12 | 16;
};

const HeartOutline = (props: Props) => {
  const size = props.size || 16;

  if (size === 12) {
    return (
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.5797 2.67974C10.4942 1.60285 8.73434 1.60285 7.64889 2.67973L6.99375 3.41493L6.33861 2.67975C5.25316 1.60286 3.49329 1.60286 2.40784 2.67975C1.32239 3.75663 1.32239 5.50261 2.40784 6.5795L6.99374 11.1292L11.5797 6.57949C12.6651 5.5026 12.6651 3.75662 11.5797 2.67974Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1041 2.9055C12.6568 1.46965 10.3103 1.46965 8.86307 2.9055L7.98955 3.88576L7.11603 2.90552C5.66876 1.46967 3.32227 1.46967 1.875 2.90552C0.427734 4.34137 0.427732 6.66934 1.875 8.10519L7.98953 14.1715L14.1041 8.10517C15.5514 6.66932 15.5514 4.34135 14.1041 2.9055Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartOutline;
