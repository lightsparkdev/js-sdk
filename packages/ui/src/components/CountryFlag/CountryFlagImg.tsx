import styled from "@emotion/styled";

type CountryFlagImgProps = {
  countryCode: string;
  height?: number;
  /** Map of country code → SVG URL, built via `buildCountryFlagSvgUrls`. */
  flagUrls: Record<string, string>;
  /** Fallback URL when no flag is found. */
  placeholderUrl?: string;
};

export function CountryFlagImg({
  countryCode,
  height = 32,
  flagUrls,
  placeholderUrl,
}: CountryFlagImgProps) {
  const imgSrc = flagUrls[countryCode.toLowerCase()];
  if (!imgSrc && !placeholderUrl) {
    return <Placeholder style={{ width: height, height }} />;
  }
  return (
    <StyledCountryFlagImg
      alt={`${countryCode} country flag`}
      src={imgSrc || placeholderUrl}
      height={height}
    />
  );
}

const StyledCountryFlagImg = styled.img`
  border-radius: 999px;
`;

const Placeholder = styled.div`
  border-radius: 999px;
  background: #e0e0e0;
`;
