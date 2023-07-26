// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type Props = {
  color?: "green" | "gray";
};

const VerticalArrows = (props: Props) => (
  <svg
    width="25"
    height="22"
    viewBox="0 0 25 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.0044 16.3846L18.3881 21.0009M18.3881 21.0009L13.7718 16.3846M18.3881 21.0009L18.3881 2.53564"
      stroke={props.color === "green" ? "#17C27C" : "#999999"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 5.6164L5.61631 1.00009M5.61631 1.00009L10.2326 5.6164M5.61631 1.00009L5.61631 19.4653"
      stroke={props.color === "green" ? "#17C27C" : "#999999"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default VerticalArrows;
