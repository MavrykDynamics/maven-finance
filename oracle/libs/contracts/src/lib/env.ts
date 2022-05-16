import { accountPerNetwork } from './accounts';

export type NetworkName =
  | 'development'
  | 'ithacanet'
  | 'ithacanet-kms'
  | 'hangzhounet'
  | 'mainnet';

export type Network = {
  rpc: string;
  network_id: string;
  secretKey: string;
  pkh: string;
  port: number;
};

export type NetworkConfig = {
  confirmationPollingTimeoutSecond: number;
  network: NetworkName;
  networks: Record<NetworkName, Network>;
  syncInterval: number;
  confirmTimeout: number;
  buildDir: string;
  migrationsDir: string;
  contractsDir: string;
  ligoVersion: string;
};

export const networkConfig: NetworkConfig = {
  confirmationPollingTimeoutSecond: 500000,
  syncInterval: 0, // 0 for tests, 5000 for deploying
  confirmTimeout: 90000, // 90000 for tests, 180000 for deploying
  buildDir: 'src/lib/contracts/json',
  migrationsDir: 'src/lib/migrations',
  contractsDir: 'src/lib/contracts/main',
  ligoVersion: '0.39.0',
  network: 'development',
  networks: {
    development: {
      rpc: 'http://localhost:8732',
      network_id: '*',
      secretKey: accountPerNetwork.development.alice.sk,
      pkh: accountPerNetwork.development.alice.pkh,
      port: 8732,
    },
    hangzhounet: {
      rpc: 'https://hangzhounet.api.tez.ie/',
      port: 443,
      network_id: '*',
      secretKey: accountPerNetwork.hangzhounet.alice.sk,
      pkh: accountPerNetwork.hangzhounet.alice.pkh,
    },
    ithacanet: {
      rpc: 'https://ithacanet.ecadinfra.com',
      port: 443,
      network_id: '*',
      secretKey: accountPerNetwork.ithacanet.alice.sk,
      pkh: accountPerNetwork.ithacanet.alice.pkh,
    },
    'ithacanet-kms': {
      rpc: 'https://ithacanet.ecadinfra.com',
      port: 443,
      network_id: '*',
      secretKey: accountPerNetwork.ithacanet.alice.sk,
      pkh: accountPerNetwork.ithacanet.alice.pkh,
    },
    mainnet: {
      rpc: 'https://mainnet.api.tez.ie',
      port: 443,
      network_id: '*',
      secretKey: accountPerNetwork.mainnet.alice.sk,
      pkh: accountPerNetwork.mainnet.alice.pkh,
    },
  },
};
