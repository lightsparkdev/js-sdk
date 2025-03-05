import { type PathProps } from "../types.js";

export function SubscriptionTick1({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0002 1.99961C12.2174 1.99961 12.4239 2.09376 12.5663 2.2577L14.74 4.75949L18.0133 4.24024C18.2278 4.20622 18.4465 4.26685 18.6129 4.40645C18.7793 4.54605 18.877 4.75092 18.8807 4.96807L18.9377 8.28179L21.779 9.98805C21.9652 10.0999 22.0938 10.2869 22.1315 10.5008C22.1692 10.7147 22.1123 10.9344 21.9756 11.1031L19.8893 13.6783L20.969 16.8116C21.0398 17.017 21.0181 17.2429 20.9095 17.431C20.8009 17.6191 20.6161 17.7509 20.4029 17.7922L17.1494 18.4238L15.9625 21.5182C15.8847 21.721 15.7228 21.8801 15.5187 21.9544C15.3146 22.0287 15.0884 22.0108 14.8985 21.9055L12.0002 20.298L9.10184 21.9055C8.91191 22.0108 8.68564 22.0287 8.48156 21.9544C8.27747 21.8801 8.1156 21.721 8.03782 21.5182L6.85086 18.4238L3.59739 17.7922C3.38419 17.7509 3.1994 17.6191 3.0908 17.431C2.98221 17.2429 2.96048 17.017 3.03124 16.8116L4.111 13.6783L2.02468 11.1031C1.88796 10.9344 1.8311 10.7147 1.86882 10.5008C1.90653 10.2869 2.03511 10.0999 2.2213 9.98805L5.06254 8.28179L5.11958 4.96807C5.12332 4.75092 5.22101 4.54605 5.38738 4.40645C5.55376 4.26685 5.77248 4.20622 5.98698 4.24024L9.26026 4.75949L11.434 2.2577C11.5765 2.09376 11.783 1.99961 12.0002 1.99961ZM15.0305 11.2799C15.3234 10.987 15.3234 10.5122 15.0305 10.2193C14.7376 9.92639 14.2627 9.92639 13.9698 10.2193L11.0002 13.1889L10.0305 12.2193C9.73756 11.9264 9.26268 11.9264 8.96979 12.2193C8.6769 12.5122 8.6769 12.987 8.96979 13.2799L10.4698 14.7799C10.6105 14.9206 10.8013 14.9996 11.0002 14.9996C11.1991 14.9996 11.3899 14.9206 11.5305 14.7799L15.0305 11.2799Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M15.0305 11.2798C15.3234 10.9869 15.3234 10.5121 15.0305 10.2192C14.7376 9.92629 14.2627 9.92629 13.9698 10.2192L11.0002 13.1888L10.0305 12.2192C9.73756 11.9263 9.26268 11.9263 8.96979 12.2192C8.6769 12.5121 8.6769 12.9869 8.96979 13.2798L10.4698 14.7798C10.6105 14.9205 10.8013 14.9995 11.0002 14.9995C11.1991 14.9995 11.3899 14.9205 11.5305 14.7798L15.0305 11.2798Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
