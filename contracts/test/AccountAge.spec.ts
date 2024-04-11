import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AccountAge__factory, MockBrevisProof__factory } from '../typechain';

const vkHash = '0x8888888888888888888888888888888888888888888888888888888888888888';

async function deployAccountAgeFixture() {
  const [owner, otherAccount] = await ethers.getSigners();
  const MockBrevisProof = (await ethers.getContractFactory('MockBrevisProof')) as MockBrevisProof__factory;
  const mockBrevisProof = await MockBrevisProof.deploy();

  const AccountAge = (await ethers.getContractFactory('AccountAge')) as AccountAge__factory;
  const accountAge = await AccountAge.deploy(mockBrevisProof.getAddress());
  await accountAge.setVkHash(vkHash);

  return { accountAge, mockBrevisProof, owner };
}

describe('Account age', async () => {
  it('should handle proof result in callback', async () => {
    const { accountAge, mockBrevisProof, owner } = await loadFixture(deployAccountAgeFixture);

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    // Generating some test data
    // In guest circuit we have:
    // api.OutputAddress(tx.From)
    // api.OutputUint(64, tx.BlockNum)
    // Thus, in practice Brevis would call our contract with abi.encodePacked(address, uint64)
    // requestId doesn't matter here as we don't use it
    const requestId = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const expectedAccount = '0x1234567812345678123456781234567812345678';
    const expectedBlockNum = 12345678;

    const testCircuitOutput = ethers.solidityPacked(['address', 'uint64'], [expectedAccount, expectedBlockNum]);
    const testOutputCommit = ethers.keccak256(testCircuitOutput);

    await mockBrevisProof.setMockOutput(requestId, testOutputCommit, vkHash);

    const tx = await accountAge.brevisCallback(requestId, testCircuitOutput);
    await expect(tx).to.emit(accountAge, 'AccountAgeAttested').withArgs(expectedAccount, expectedBlockNum);
  });
});
