import { Dialog } from "./index";
import { Button } from "../Button";

const LONG_CONTENT = Array.from({ length: 30 }, (_, index) => (
  <p key={index}>
    Long dialog content section {index + 1}. This content verifies that the
    dialog body remains reachable.
  </p>
));

export function TestDialog() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Test Title</Dialog.Title>
            <Dialog.Description>Test description text.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <p>Test content area.</p>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
            <Dialog.Close render={<Button variant="filled" />}>
              Confirm
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TestLongViewportDialog() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Backdrop data-testid="long-dialog-backdrop" />
        <Dialog.Viewport>
          <Dialog.Popup data-testid="long-dialog-popup">
            <Dialog.CloseButton />
            <Dialog.Header data-testid="long-dialog-header">
              <Dialog.Title>Long Dialog</Dialog.Title>
              <Dialog.Description>
                Scroll the body to review all content.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Content data-testid="long-dialog-content">
              <Button variant="outline">First body control</Button>
              {LONG_CONTENT}
              <Button variant="outline">Final body control</Button>
            </Dialog.Content>
            <Dialog.Footer data-testid="long-dialog-footer">
              <Dialog.Close render={<Button variant="outline" />}>
                Cancel
              </Dialog.Close>
              <Button variant="filled">Confirm</Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TestDialogWithTrigger() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Open Dialog
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Test Title</Dialog.Title>
            <Dialog.Description>Test description.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TestDialogWithoutCloseButton() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>No Close Button</Dialog.Title>
            <Dialog.Description>
              This dialog has no X button.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TestDialogContentOnly() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Content>
            <p>Content without header or footer.</p>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
