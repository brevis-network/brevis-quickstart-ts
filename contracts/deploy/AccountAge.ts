import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: string[] = ['0x4446e0f8417C1db113899929A8F3cEe8e0DcBCDb']; // BrevisProof contract address on sepolia
  const deployment = await deploy('AccountAge', {
    from: deployer,
    log: true,
    args: args
  });

  await hre.run('verify:verify', {
    address: deployment.address,
    constructorArguments: args ?? deployment.args
  });
};

deployFunc.tags = ['AccountAge'];
deployFunc.dependencies = [];
export default deployFunc;
