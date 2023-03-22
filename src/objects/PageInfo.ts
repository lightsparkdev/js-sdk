// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type PageInfo = {
  hasNextPage?: boolean;

  hasPreviousPage?: boolean;

  startCursor?: string;

  endCursor?: string;
};

export const PageInfoFromJson = (obj: any): PageInfo => {
  return {
    hasNextPage: obj["page_info_has_next_page"],
    hasPreviousPage: obj["page_info_has_previous_page"],
    startCursor: obj["page_info_start_cursor"],
    endCursor: obj["page_info_end_cursor"],
  } as PageInfo;
};

export const FRAGMENT = `
fragment PageInfoFragment on PageInfo {
    __typename
    page_info_has_next_page: has_next_page
    page_info_has_previous_page: has_previous_page
    page_info_start_cursor: start_cursor
    page_info_end_cursor: end_cursor
}`;

export default PageInfo;
