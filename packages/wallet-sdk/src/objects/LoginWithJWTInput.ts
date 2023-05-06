// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type LoginWithJWTInput = {
  accountId: string;

  jwt: string;
};

export const LoginWithJWTInputFromJson = (obj: any): LoginWithJWTInput => {
  return {
    accountId: obj["login_with_j_w_t_input_account_id"],
    jwt: obj["login_with_j_w_t_input_jwt"],
  } as LoginWithJWTInput;
};

export default LoginWithJWTInput;
