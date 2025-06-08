declare module '@solana/web3.js' {
  export class Connection {
    constructor(endpoint: string);
  }
  export class PublicKey {
    constructor(key: string);
  }
}

declare module '@raydium-io/raydium-sdk-v2' {
  export interface ApiV3PoolInfoItem {
    price: string;
    tvl?: string;
    type?: string;
  }
  export class Raydium {
    static load(args: any): Promise<Raydium>;
    api: any;
  }
}
