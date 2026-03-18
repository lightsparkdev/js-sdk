"use client";

import * as React from "react";
import { Card } from "./index";
import { Button } from "@/components/Button";

export function StructuredCard() {
  return (
    <Card.Root variant="structured" data-testid="card">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Card title</Card.Title>
          <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <p>
          Slot components in to the body here to extend the functionality of the
          card.
        </p>
      </Card.Body>
      <Card.Footer>
        <Button>Button</Button>
      </Card.Footer>
    </Card.Root>
  );
}

export function StructuredCardWithBackButton() {
  const [clicked, setClicked] = React.useState(false);

  return (
    <>
      <Card.Root variant="structured" data-testid="card">
        <Card.Header>
          <Card.BackButton
            onClick={() => setClicked(true)}
            data-testid="back-button"
          />
          <Card.TitleGroup>
            <Card.Title>Card title</Card.Title>
            <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <p>Body content here.</p>
        </Card.Body>
        <Card.Footer>
          <Button>Button</Button>
        </Card.Footer>
      </Card.Root>
      {clicked && <div data-testid="back-clicked">Back clicked</div>}
    </>
  );
}

export function SimpleCard() {
  return (
    <Card.Root variant="simple" data-testid="card">
      <Card.TitleGroup>
        <Card.Title>Card title</Card.Title>
        <Card.Subtitle>Subtitle goes here.</Card.Subtitle>
      </Card.TitleGroup>
      <Card.Body>
        <p>
          Slot components in to the body here to extend the functionality of the
          card.
        </p>
      </Card.Body>
      <Button>Button</Button>
    </Card.Root>
  );
}

export function CardTitleOnly() {
  return (
    <Card.Root variant="simple" data-testid="card">
      <Card.TitleGroup>
        <Card.Title>Title only card</Card.Title>
      </Card.TitleGroup>
      <Card.Body>
        <p>No subtitle in this card.</p>
      </Card.Body>
    </Card.Root>
  );
}

export function CardCustomClassName() {
  return (
    <Card.Root
      variant="simple"
      data-testid="card"
      className="custom-card-class"
    >
      <Card.TitleGroup>
        <Card.Title className="custom-title-class">Custom styled</Card.Title>
      </Card.TitleGroup>
      <Card.Body className="custom-body-class">
        <p>Content with custom classes.</p>
      </Card.Body>
    </Card.Root>
  );
}

export function CardWithMultipleFooterButtons() {
  return (
    <Card.Root variant="structured" data-testid="card">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Multiple actions</Card.Title>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <p>Footer can contain multiple buttons.</p>
      </Card.Body>
      <Card.Footer>
        <Button variant="outline">Cancel</Button>
        <Button variant="filled">Confirm</Button>
      </Card.Footer>
    </Card.Root>
  );
}

export function CardWithFullwidthBody() {
  return (
    <Card.Root variant="structured" data-testid="card">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Fullwidth body</Card.Title>
          <Card.Subtitle>Body has no horizontal padding</Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body fullwidth>
        <div style={{ background: "#eee", padding: "12px" }}>
          Edge-to-edge content
        </div>
      </Card.Body>
      <Card.Footer>
        <Button>Button</Button>
      </Card.Footer>
    </Card.Root>
  );
}
