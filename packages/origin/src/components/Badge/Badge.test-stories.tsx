"use client";

import { Badge } from "./Badge";

export function DefaultBadge() {
  return <Badge>Test Label</Badge>;
}

export function PurpleBadge() {
  return <Badge variant="purple">Purple</Badge>;
}

export function BlueBadge() {
  return <Badge variant="blue">Blue</Badge>;
}

export function VibrantBadge() {
  return (
    <Badge variant="blue" vibrant>
      Vibrant
    </Badge>
  );
}

export function SkyBadge() {
  return <Badge variant="sky">Sky</Badge>;
}

export function AllVariantsBadge() {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Badge variant="gray">Gray</Badge>
      <Badge variant="purple">Purple</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="sky">Sky</Badge>
      <Badge variant="pink">Pink</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="red">Red</Badge>
    </div>
  );
}

export function VibrantVariantsBadge() {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Badge variant="gray" vibrant>
        Gray
      </Badge>
      <Badge variant="purple" vibrant>
        Purple
      </Badge>
      <Badge variant="blue" vibrant>
        Blue
      </Badge>
      <Badge variant="sky" vibrant>
        Sky
      </Badge>
      <Badge variant="pink" vibrant>
        Pink
      </Badge>
      <Badge variant="green" vibrant>
        Green
      </Badge>
      <Badge variant="yellow" vibrant>
        Yellow
      </Badge>
      <Badge variant="red" vibrant>
        Red
      </Badge>
    </div>
  );
}

export function CustomClassBadge() {
  return <Badge className="custom-class">Custom</Badge>;
}
