import { AlertDialog } from "./index";
import { Button } from "../Button";

export function TestDialog() {
  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title>Test Title</AlertDialog.Title>
          <AlertDialog.Description>
            Test description text.
          </AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant="outline" />}>
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close render={<Button variant="filled" />}>
              Confirm
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function TestDialogWithTrigger() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button variant="outline" />}>
        Open Dialog
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title>Test Title</AlertDialog.Title>
          <AlertDialog.Description>Test description.</AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant="outline" />}>
              Cancel
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
