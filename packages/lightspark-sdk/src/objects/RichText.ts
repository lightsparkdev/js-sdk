// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface RichText {
  text: string;
}

export const RichTextFromJson = (obj: any): RichText => {
  return {
    text: obj["rich_text_text"],
  } as RichText;
};
export const RichTextToJson = (obj: RichText): any => {
  return {
    rich_text_text: obj.text,
  };
};

export const FRAGMENT = `
fragment RichTextFragment on RichText {
    __typename
    rich_text_text: text
}`;

export default RichText;
