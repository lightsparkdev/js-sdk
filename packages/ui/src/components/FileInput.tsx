import styled from "@emotion/styled";
import { Fragment, useRef, useState } from "react";
import { InputSubtext, inputBlockStyle } from "../styles/fields.js";
import { Icon } from "./Icon.js";
import { Pill } from "./Pill.js";

type FileInputProps = {
  name: string;
  onChange: (fileContent: string) => void;
  filePurpose?: string;
  onRemoveFile: () => void;
};

export function FileInput({
  name,
  onChange,
  filePurpose = "",
  onRemoveFile,
}: FileInputProps) {
  const [fileName, setFileName] = useState<string>();
  const [fileContent, setFileContent] = useState<string>();
  const [fileErrorMsg, setFileErrorMsg] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("tmp state", { fileName, fileContent, fileErrorMsg });

  const handleChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (readEvent) => {
      let fileContent = readEvent?.target?.result;
      setFileName(file.name);
      if (!fileContent) {
        setFileErrorMsg("Unable to read file");
        return;
      }
      if (typeof fileContent !== "string") {
        fileContent = new TextDecoder().decode(fileContent);
      }
      setFileErrorMsg(undefined);
      setFileContent(fileContent);
      onChange(fileContent);
    };
    reader.readAsText(file);
  };

  function handleRemoveFile() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileName(undefined);
    setFileContent(undefined);
    setFileErrorMsg(undefined);
    onRemoveFile();
  }

  return (
    <StyledFileInputContainer>
      <StyledFileInput hasValidFileSet={Boolean(fileName && fileContent)}>
        <label htmlFor={name}>
          {fileName && fileContent ? (
            <Pill
              text={fileName}
              cursor="pointer"
              onDeleteMouseDown={handleRemoveFile}
              onDeleteFromKeyboard={handleRemoveFile}
            />
          ) : (
            <Fragment>
              <Icon name="Upload" width={26} tutorialStep={6} />
              Upload {filePurpose || ""} file
            </Fragment>
          )}
        </label>
        <input
          type="file"
          id={name}
          onChange={handleChange}
          ref={fileInputRef}
        />
      </StyledFileInput>
      {fileErrorMsg ? (
        <InputSubtext text={fileErrorMsg} hasError={true} />
      ) : null}
    </StyledFileInputContainer>
  );
}

const StyledFileInputContainer = styled.div``;

type StyledFileInputProps = { hasValidFileSet: boolean };

export const StyledFileInput = styled.div<StyledFileInputProps>`
  input[type="file"] {
    display: none;
  }

  label {
    display: block;
    cursor: pointer;
    ${({ theme, hasValidFileSet }) =>
      inputBlockStyle({ theme, hasValue: hasValidFileSet, hasError: false })}
  }
`;
