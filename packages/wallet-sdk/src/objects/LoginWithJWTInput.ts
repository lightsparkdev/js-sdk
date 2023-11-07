// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface LoginWithJWTInput {
  accountId: string;

  jwt: string;
}

export const LoginWithJWTInputFromJson = (obj: any): LoginWithJWTInput => {
  return {
    accountId: obj["login_with_j_w_t_input_account_id"],
    jwt: obj["login_with_j_w_t_input_jwt"],
  } as LoginWithJWTInput;
};
export const LoginWithJWTInputToJson = (obj: LoginWithJWTInput): any => {
  return {
    login_with_j_w_t_input_account_id: obj.accountId,
    login_with_j_w_t_input_jwt: obj.jwt,
  };
};

export default LoginWithJWTInput;
