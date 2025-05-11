pragma circom 2.0.0;

// Import the LessThan comparator and Poseidon hash from circomlib.
// (Ensure that your circomlib version contains these components.)
include "../node_modules/circomlib/circuits/comparators.circom"
include "../node_modules/circomlib/circuits/poseidon.circom"
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";
include "merkleTree.circom";


template CommitmentHasher() {

    signal input nullifier;
    signal input secret;
    signal input timestamp;
    signal output commitment;
    signal output nullifierHash;



    component nullifierHasher = Pedersen(248);


    component commitmentHasher = Pedersen(744);

    component nullifierBits = Num2Bits(248);
    component secretBits = Num2Bits(248);
    component timestampBits = Num2Bits(248);

    nullifierBits.in <== nullifier;
    secretBits.in <== secret;
    timestampBits.in <== timestamp;

    for (var i = 0; i < 248; i++) {

        nullifierHasher.in[i] <== nullifierBits.out[i];

        commitmentHasher.in[i] <== nullifierBits.out[i];
        commitmentHasher.in[i + 248] <== secretBits.out[i];
        commitmentHasher.in[i + 496] <== timestampBits.out[i];
    }

    commitment <== commitmentHasher.out[0];
    nullifierHash <== nullifierHasher.out[0];
}

template TimeDelayCircuit(levels) {
    
    // Public input: current block timestamp (e.g., block.timestamp on-chain)
    signal input currentTime;
    
    // Private inputs:
    // 'timestamp' is the time when the commitment was created.
    // 'secret' and 'nullifier' are used to generate the commitment.
    signal input timestamp;
    signal input secret;
    signal input nullifier;

    signal input pathElements[levels];
    signal input pathIndices[levels];


    signal output nullifierHash;
    signal output root;




    component commitmentHasher = CommitmentHasher();

    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    commitmentHasher.timestamp <== timestamp;


    component merkleTreeChecker = MerkleTreeChecker(levels);

    merkleTreeChecker.leaf <== commitmentHasher.commitment;

    for (var i = 0; i < levels; i++) {
        merkleTreeChecker.pathElements[i] <== pathElements[i];
        merkleTreeChecker.pathIndices[i] <== pathIndices[i];
    }


    // Compute the time difference (assuming inputs are within a known bound,
    // e.g., timestamps are less than 2^32).
    signal diff;
    diff <== currentTime - timestamp;

    // Check that diff >= 300 (i.e. at least one hour has passed).
    // The LessThan gadget outputs 1 if diff < 300 and 0 otherwise.
    component lt = LessThan(32);
    lt.in[0] <== diff;
    lt.in[1] <== 300;
    // Enforce that diff is NOT less than 300
    lt.out === 0;


    nullifierHash <== commitmentHasher.nullifierHash;
    root <== merkleTreeChecker.root;
}

// Define the main component.
component main = TimeDelayCircuit(20);
