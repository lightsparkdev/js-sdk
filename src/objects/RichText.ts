// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type RichText = {
  text: string;
};

export const RichTextFromJson = (obj: any): RichText => {
  return {
    text: obj["rich_text_text"],
  } as RichText;
};

export const FRAGMENT = `
fragment RichTextFragment on RichText {
    __typename
    rich_text_text: text
}`;

export default RichText;
