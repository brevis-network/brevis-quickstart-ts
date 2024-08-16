import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';

import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';

dotenv.config();

const sepoliaEndpoint = process.env.SEPOLIA_ENDPOINT || 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const privateKey = process.env.PRIVATE_KEY || 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const bscTestEndpoint = process.env.BSC_TEST_ENDPOINT || 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      blockGasLimit: 120_000_000
    },
    localhost: { timeout: 600000 },
    sepolia: {
      url: sepoliaEndpoint,
      accounts: [`0x${privateKey}`]
    },
    bscTest: {
      url: bscTestEndpoint,
      accounts: [`0x${privateKey}`]
    }
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      },
      viaIR: true
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6'
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY as string,
      bscTestnet: process.env.BSC_ETHERSCAN_API_KEY as string
    }
  }
};

export default config;
