// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum BitcoinNetwork {
  /** The production version of the Bitcoin Blockchain. **/
  MAINNET = "MAINNET",
  /** A test version of the Bitcoin Blockchain, maintained by Lightspark. **/
  REGTEST = "REGTEST",
  /** A test version of the Bitcoin Blockchain, maintained by a centralized organization. Not in use at Lightspark. **/
  SIGNET = "SIGNET",
  /** A test version of the Bitcoin Blockchain, publically available. **/
  TESTNET = "TESTNET",
}

export default BitcoinNetwork;
