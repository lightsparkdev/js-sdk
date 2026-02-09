---
"@lightsparkdev/ui": patch
---

- CodeInput: Clicking the unified code input now moves the cursor to the first empty input field instead of wherever the user clicked, improving OTP entry UX.
- CardForm: CardFormContentFull now sets width: 100% for proper full-width layout.
- CardPage: New headerRightContent prop to render content on the right side of the card page header.
- DataManagerTable filters: AppliedButtonsContainer extracted to a shared component with max-width: 100% on buttons (prevents overflow for long filter values).
- New icon: BankSolid icon added (exported as CentralBankSolid).
