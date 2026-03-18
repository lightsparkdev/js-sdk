import { PreviewCard } from "./index";

export const TestDefault = () => (
  <PreviewCard.Root defaultOpen>
    <PreviewCard.Trigger href="#">Hover me</PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup data-testid="popup">
          <p>Preview content</p>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
);

export const TestHover = () => (
  <PreviewCard.Root>
    <PreviewCard.Trigger href="#" data-testid="trigger">
      Hover me
    </PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup data-testid="popup">
          <p>Preview content</p>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
);

export const TestWithArrow = () => (
  <PreviewCard.Root defaultOpen>
    <PreviewCard.Trigger href="#">Hover me</PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup data-testid="popup">
          <PreviewCard.Arrow data-testid="arrow" />
          <p>Preview with arrow</p>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
);

export const TestRichContent = () => (
  <PreviewCard.Root defaultOpen>
    <PreviewCard.Trigger href="#">Typography</PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup data-testid="popup">
          <img src="" alt="Preview image" width={200} height={120} />
          <p>Rich content with an image and text</p>
          <a href="#" data-testid="inner-link">
            Learn more
          </a>
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
);
