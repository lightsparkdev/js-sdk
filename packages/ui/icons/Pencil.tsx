// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type Props = {
  color?: "black" | "white";
};

const Pencil = (props: Props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.88851 2.9033L1 8.79181V11H3.20819L9.0967 5.11149M6.88851 2.9033L8.57623 1.21559C8.86367 0.928136 9.32974 0.928136 9.61717 1.21559L10.7844 2.38283C11.0719 2.67028 11.0719 3.13633 10.7844 3.42378L9.0967 5.11149M6.88851 2.9033L9.0967 5.11149"
      stroke={props.color || "black"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Pencil;