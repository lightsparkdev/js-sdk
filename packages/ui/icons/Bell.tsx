// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type Props = {
  color: "black" | "gray";
};

const Bell = (props: Props) => (
  <svg
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.19964 13.5193C2.46828 14.2557 3.1996 15.7286 4.66232 15.7286H16.3641C17.8269 15.7286 18.5582 14.2557 17.8268 13.5193C17.0955 12.7829 15.7471 11.31 15.7471 9.83715V6.15501C15.7471 3.20929 14.17 1 10.5132 1C6.85638 1 5.2109 3.20929 5.2109 6.15501V9.83715C5.2109 11.31 3.931 12.7829 3.19964 13.5193Z"
      stroke={props.color === "black" ? "#000000" : "#999999"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.76683 18.0752C8.17914 19.199 9.25257 20.0001 10.5118 20.0001C11.7711 20.0001 12.8445 19.199 13.2569 18.0752H7.76683Z"
      fill={props.color === "black" ? "#000000" : "#999999"}
    />
  </svg>
);

export default Bell;
