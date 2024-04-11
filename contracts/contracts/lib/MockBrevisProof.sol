// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./IBrevisProof.sol";

contract MockBrevisProof is IBrevisProof {

    mapping(bytes32 => Brevis.ProofData) public mockOutput;

    function setMockOutput(bytes32 requestId, bytes32 outputCommit, bytes32 vkHash) public {
        mockOutput[requestId] = Brevis.ProofData({
            commitHash: 0,
            length: 0,
            vkHash: 0,
            appCommitHash: outputCommit,
            appVkHash: vkHash,
            smtRoot: 0
        });
    }

    function submitProof(
        uint64 _chainId,
        bytes calldata _proofWithPubInputs,
        bool _withAppProof
    ) external returns (bytes32 _requestId) {
        return bytes32(0);
    }

    function hasProof(bytes32 _requestId) external view returns (bool) {
        Brevis.ProofData memory data = mockOutput[_requestId];
        return data.appVkHash == 0 && data.appCommitHash == 0;
    }

    // used by contract app
    function validateRequest(bytes32 _requestId, uint64 _chainId, Brevis.ExtractInfos memory _info) external view {}

    function getProofData(bytes32 _requestId) external view returns (Brevis.ProofData memory) {
        return mockOutput[_requestId];
    }

    // return appCommitHash and appVkHash
    function getProofAppData(bytes32 _requestId) external view returns (bytes32, bytes32) {
        Brevis.ProofData memory data = mockOutput[_requestId];
        return (data.appCommitHash, data.appVkHash);
    }
}
