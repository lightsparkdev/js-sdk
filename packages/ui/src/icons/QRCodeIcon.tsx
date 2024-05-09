// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useId } from "react";

export function QRCodeIcon() {
  /**
   * unique id is required per instance to prevent interferring ids breaking
   * icon styles
   */
  const id = useId();

  return (
    <svg
      width="100%"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#clip0_3508_2717-${id})`}>
        <path
          d="M1.19725 4.03679H4.28314C4.54577 4.03679 4.75859 3.82397 4.75859 3.56134V0.475449C4.75859 0.21282 4.54577 0 4.28314 0H1.19725C0.935188 0 0.721802 0.21282 0.721802 0.475449V3.56134C0.721802 3.82397 0.934622 4.03679 1.19725 4.03679V4.03679ZM1.6727 0.950899H3.80769V3.08589H1.6727V0.950899Z"
          fill="currentColor"
        />
        <path
          d="M12.2458 0H9.1599C8.89727 0 8.68445 0.21282 8.68445 0.475449V3.56191C8.68445 3.82454 8.89727 4.03736 9.1599 4.03736H12.2458C12.5084 4.03736 12.7212 3.82454 12.7212 3.56191V0.476015C12.7212 0.213386 12.5084 0 12.2458 0ZM11.7703 3.08589H9.63591V0.951465H11.7703V3.08589Z"
          fill="currentColor"
        />
        <path
          d="M4.3161 7.96387H1.23021C0.967581 7.96387 0.754761 8.17669 0.754761 8.43932V11.5252C0.754761 11.7878 0.967581 12.0007 1.23021 12.0007H4.3161C4.57873 12.0007 4.79155 11.7878 4.79155 11.5252V8.43932C4.79155 8.17669 4.57873 7.96387 4.3161 7.96387ZM3.84065 11.0498H1.70566V8.91533H3.84065V11.0498V11.0498Z"
          fill="currentColor"
        />
        <path
          d="M12.2458 7.96375H9.1599C8.89727 7.96375 8.68445 8.17657 8.68445 8.43919V11.5251C8.68445 11.7877 8.89727 12.0005 9.1599 12.0005H12.2458C12.5084 12.0005 12.7212 11.7877 12.7212 11.5251V8.43919C12.7212 8.17657 12.5084 7.96375 12.2458 7.96375ZM11.7703 11.0496H9.63591V8.91521H11.7703V11.0496Z"
          fill="currentColor"
        />
        <path
          d="M6.7379 0C6.47527 0 6.26245 0.21282 6.26245 0.475449V3.56191C6.26245 3.82454 6.47527 4.03736 6.7379 4.03736C7.00053 4.03736 7.21335 3.82454 7.21335 3.56191V0.476015C7.21335 0.213386 7.00053 0 6.7379 0Z"
          fill="currentColor"
        />
        <path
          d="M12.2458 5.54126L9.19164 5.54126C8.92901 5.54126 8.71619 5.75408 8.71619 6.01671C8.71619 6.27934 8.92901 6.49216 9.19164 6.49216L12.2458 6.49216C12.5084 6.49216 12.7212 6.27934 12.7212 6.01671C12.7212 5.75408 12.5084 5.54126 12.2458 5.54126Z"
          fill="currentColor"
        />
        <path
          d="M7.541 5.54126L6.95616 5.54126C6.69353 5.54126 6.48071 5.75408 6.48071 6.01671C6.48071 6.27934 6.69353 6.49216 6.95616 6.49216L7.541 6.49216C7.80363 6.49216 8.01645 6.27934 8.01645 6.01671C8.01645 5.75408 7.80363 5.54126 7.541 5.54126Z"
          fill="currentColor"
        />
        <path
          d="M6.7379 10.2861C6.47527 10.2861 6.26245 10.499 6.26245 10.7616V11.5246C6.26245 11.7872 6.47527 12 6.7379 12C7.00053 12 7.21335 11.7872 7.21335 11.5246V10.7616C7.21335 10.499 7.00053 10.2861 6.7379 10.2861Z"
          fill="currentColor"
        />
        <path
          d="M6.7379 5.54126H4.91478C4.65215 5.54126 4.43933 5.75408 4.43933 6.01671C4.43933 6.27934 4.65215 6.49216 4.91478 6.49216H6.26415V8.93676C6.26415 9.19939 6.47697 9.41221 6.7396 9.41221C7.00223 9.41221 7.21505 9.19939 7.21505 8.93676V6.01671C7.21505 5.89049 7.16467 5.7688 7.07524 5.67994C6.98582 5.59107 6.86412 5.5407 6.7379 5.54126V5.54126Z"
          fill="currentColor"
        />
        <path
          d="M1.19725 6.49216H2.87264C3.13527 6.49216 3.34809 6.27934 3.34809 6.01671C3.34809 5.75408 3.13527 5.54126 2.87264 5.54126H1.19725C0.934622 5.54126 0.721802 5.75408 0.721802 6.01671C0.721802 6.27934 0.934622 6.49216 1.19725 6.49216Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={`clip0_3508_2717-${id}`}>
          <rect
            width="11.9994"
            height="12"
            fill="white"
            transform="translate(0.721802)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
