import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  Modal,
  TextInput,
  Toasts,
  Toggle,
} from "@lightsparkdev/ui/components";
import { Headline } from "@lightsparkdev/ui/components/typography";
import { GlobalStyles } from "@lightsparkdev/ui/styles/global";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { TestAppRoutes } from "./types";

export function Root() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [toggleValue, setToggleValue] = useState(true);
  return (
    <BrowserRouter>
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
          <Toasts
            queue={[
              {
                text: "Another test toast",
                duration: 5000,
                id: "test-toast-2",
                expires: Date.now() + 10_000,
              },
              {
                text: [
                  {
                    text: "Test toast, with a ",
                  },
                  {
                    link: {
                      text: "link to page one",
                      to: TestAppRoutes.PageOne,
                    },
                  },
                  ". But it will cost you ",
                  {
                    currencyAmount: {
                      amount: {
                        value: 1,
                        unit: "USD",
                      },
                    },
                  },
                ],
                duration: 5000,
                id: "test-toast",
                expires: Date.now() + 5000,
              },
            ]}
            onHide={() => {}}
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
    </BrowserRouter>
  );
}

const Aligner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
