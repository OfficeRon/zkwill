// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <=0.8.24;

import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";
import {ZKTree, IHasher, IVerifier} from "./ZKTree.sol";

struct Will {
    string socialHandle;
    uint expireDate;
}

struct WillWithHash {
    uint256 nullifierHash;
    string socialHandle;
    uint expireDate;
}

contract ZKRofl is ZKTree {
    // Maximum age of observations.
    uint private constant WILL_AMOUNT = 0.000000000001 ether;
    uint private constant REFRESH_INTERVAL = 30 days;

    // nullifier hash -> will
    mapping(uint256 => Will) public wills;
    // Array to keep track of all nullifier hashes
    uint256[] public nullifierHashes;
    // Configuration.
    uint8 public threshold;
    bytes21 public roflAppID;
    
    constructor(bytes21 _roflAppID, uint8 _threshold, uint32 _levels, IHasher _hasher, IVerifier _verifier) ZKTree(_levels, _hasher, _verifier) {
        require(_threshold > 0, "Invalid threshold");

        roflAppID = _roflAppID;
        threshold = _threshold;
    }

    function withdrawWill(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input
    ) public {
        _nullify(input[0], input[1], input[2], a, b, c);
        uint256 isOwner = input[2];
        uint256 nullifierHash = input[0];
        if (isOwner == 0) {
            require(wills[nullifierHash].expireDate > block.timestamp, "Withdraw not allowed");
        }
        payable(msg.sender).transfer(WILL_AMOUNT);
    }

    function updateExpireDate(uint256 _nullifierHash) external {
        Subcall.roflEnsureAuthorizedOrigin(roflAppID);

        wills[_nullifierHash].expireDate = block.timestamp + REFRESH_INTERVAL;
    }

    function getWill(uint256 _nullifierHash) external view returns (Will memory) {
        return wills[_nullifierHash];
    }

    function createWill(uint256 _nullifierHash, string memory _socialHandle, bytes32 ownerCommitment, bytes32 heirCommitment) external payable {
        Subcall.roflEnsureAuthorizedOrigin(roflAppID);
        require(msg.value >= WILL_AMOUNT, "Insufficient amount sent");
        require(bytes(wills[_nullifierHash].socialHandle).length == 0, "Will already exists for this nullifier");

        _commit(ownerCommitment);
        _commit(heirCommitment);

        wills[_nullifierHash] = Will({
            socialHandle: _socialHandle,
            expireDate: block.timestamp + REFRESH_INTERVAL
        });
        
        nullifierHashes.push(_nullifierHash);
    }

    function getAllWillsWithHashes() external view returns (WillWithHash[] memory) {
        WillWithHash[] memory result = new WillWithHash[](nullifierHashes.length);
        
        for (uint i = 0; i < nullifierHashes.length; i++) {
            uint256 hash = nullifierHashes[i];
            Will storage willData = wills[hash];
            
            result[i] = WillWithHash({
                nullifierHash: hash,
                socialHandle: willData.socialHandle,
                expireDate: willData.expireDate
            });
        }
        
        return result;
    }

}
