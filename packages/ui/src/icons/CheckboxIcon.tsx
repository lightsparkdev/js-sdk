// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type Props = {
  checked: boolean;
};

const CheckboxIcon = (props: Props) =>
  props.checked ? (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="11"
        height="11"
        rx="1.5"
        fill="black"
        stroke="black"
      />
      <path
        d="M9 4L6.38691 7.18724C5.94268 7.72908 5.72056 8 5.44455 8C5.16854 8 4.94642 7.72908 4.50219 7.18724L4 6.57471"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="11"
        height="11"
        rx="1.5"
        fill="white"
        stroke="#999999"
      />
    </svg>
  );

export default CheckboxIcon;
