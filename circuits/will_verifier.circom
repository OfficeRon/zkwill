pragma circom 2.0.0;

include "will_commitment.circom";
include "MerkleTreeChecker.circom";

template WillVerifier(levels) {
    signal input nullifier;
    signal input secret;
    signal input inputTimestamp;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    signal output nullifierHash;
    signal output root;
    signal output timestamp;

    component commitmentHasher = WillCommitmentHasher();
    component merkleTreeChecker = MerkleTreeChecker(levels);

    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    commitmentHasher.timestamp <== inputTimestamp;

    merkleTreeChecker.leaf <== commitmentHasher.commitment;
    for (var i = 0; i < levels; i++) {
        merkleTreeChecker.pathElements[i] <== pathElements[i];
        merkleTreeChecker.pathIndices[i] <== pathIndices[i];
    }

    nullifierHash <== commitmentHasher.nullifierHash;
    root <== merkleTreeChecker.root;
    timestamp <== inputTimestamp;
}

component main = WillVerifier(20);
