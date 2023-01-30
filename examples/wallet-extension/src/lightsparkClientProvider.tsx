import { LightsparkWalletClient } from '@lightspark/js-sdk';

let instance: LightsparkWalletClient

export const getLightsparkClient = (): LightsparkWalletClient => {
  if (!instance) {
    instance = new LightsparkWalletClient("0185c15936bf4f89000019ac0f816213", "pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs", "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599");
  }
  return instance;
};
