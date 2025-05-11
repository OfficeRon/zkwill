pragma circom 2.0.0;

include "node_modules/circomlib/circuits/mimcsponge.circom";

template WillCommitmentHasher() {
    signal input nullifier;
    signal input secret;
    signal input timestamp;

    signal output commitment;
    signal output nullifierHash;

    component commitmentHasher = MiMCSponge(3, 220, 1);
    component nullifierHasher = MiMCSponge(1, 220, 1);

    commitmentHasher.ins[1] <== secret;
    commitmentHasher.ins[0] <== nullifier;
    commitmentHasher.ins[2] <== timestamp;
    commitmentHasher.k <== 0;

    nullifierHasher.ins[0] <== nullifier;
    nullifierHasher.k <== 0;

    commitment <== commitmentHasher.outs[0];
    nullifierHash <== nullifierHasher.outs[0];

}


