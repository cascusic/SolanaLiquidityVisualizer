import { Connection, PublicKey } from '@solana/web3.js';
import { Raydium } from '@raydium-io/raydium-sdk-v2';

let raydiumInstance: Raydium | null = null;

export async function initializeRaydium(): Promise<Raydium> {
  if (raydiumInstance) return raydiumInstance;

  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const dummyOwner = new PublicKey('11111111111111111111111111111111');

  raydiumInstance = await Raydium.load({
    connection,
    owner: dummyOwner,
    disableLoadToken: true,
  });

  return raydiumInstance;
}

export function getRaydiumInstance(): Raydium {
  if (!raydiumInstance) {
    throw new Error('Raydium SDK not initialized');
  }
  return raydiumInstance;
}