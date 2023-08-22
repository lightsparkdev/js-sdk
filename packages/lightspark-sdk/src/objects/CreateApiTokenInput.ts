// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import Permission from "./Permission.js";

type CreateApiTokenInput = {
  /** An arbitrary name that the user can choose to identify the API token in a list. **/
  name: string;

  /** List of permissions to grant to the API token **/
  permissions: Permission[];
};

export const CreateApiTokenInputFromJson = (obj: any): CreateApiTokenInput => {
  return {
    name: obj["create_api_token_input_name"],
    permissions: obj["create_api_token_input_permissions"].map(
      (e) => Permission[e],
    ),
  } as CreateApiTokenInput;
};

export default CreateApiTokenInput;
