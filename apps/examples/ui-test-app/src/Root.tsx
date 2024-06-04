import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  Modal,
  TextInput,
  Toggle,
} from "@lightsparkdev/ui/components";
import { Headline } from "@lightsparkdev/ui/components/typography";
import { GlobalStyles } from "@lightsparkdev/ui/styles/global";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { useState } from "react";

export function Root() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [toggleValue, setToggleValue] = useState(true);
  return (
    <ThemeProvider theme={themes.light}>
      <GlobalStyles />
      <Aligner>
        <Headline>UI Test App</Headline>
        <Checkbox
          mt={30}
          checked={checkboxValue}
          onChange={setCheckboxValue}
          label="Disable toggle"
          id="ls-checkbox"
        />
        <Toggle
          mt={30}
          label="Disable button"
          disabled={checkboxValue}
          on={toggleValue}
          onChange={setToggleValue}
          id="ls-toggle"
        />
        <Button
          mt={30}
          text="Click to open modal"
          onClick={() => setShowModal(true)}
          disabled={toggleValue}
        />
      </Aligner>
      <Modal
        title="Modal Title"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        visible={showModal}
        onClose={() => setShowModal(false)}
        submitLoading={submitting}
        onSubmit={() => {
          setSubmitting(true);
          setTimeout(() => {
            setShowModal(false);
            setSubmitting(false);
          }, 1000);
        }}
      >
        <TextInput
          label="Name"
          onChange={setTextInputValue}
          value={textInputValue}
          icon={{ name: "Logo" }}
        />
      </Modal>
    </ThemeProvider>
  );
}

const Aligner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
