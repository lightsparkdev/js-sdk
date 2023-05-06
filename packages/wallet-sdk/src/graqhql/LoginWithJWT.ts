// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as LoginWithJWTOutputFragment } from "../objects/LoginWithJWTOutput.js";

const LoginWithJWT = `
  mutation LoginWithJWT($account_id: ID!, $jwt: String!) {
    login_with_jwt(input: { account_id: $account_id, jwt: $jwt }) {
        ...LoginWithJWTOutputFragment
    }
  }

  ${LoginWithJWTOutputFragment}
`;

export default LoginWithJWT;
