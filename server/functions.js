import crypto from "crypto";
import { buildMimcSponge } from 'circomlibjs'

export async function generateCommitment(timestamp, existingNullifier = null) {
    const mimc = await buildMimcSponge();
    let nullifier = existingNullifier || BigInt('0x' + crypto.randomBytes(31).toString('hex')).toString();
    let secret;
    let commitment;
    let nullifierHash;
    // Convert the random bytes to a hexadecimal string first, then to BigInt
    secret = BigInt('0x' + crypto.randomBytes(31).toString('hex')).toString();
    commitment = mimc.F.toString(mimc.multiHash([nullifier, secret, timestamp]))
    nullifierHash = mimc.F.toString(mimc.multiHash([nullifier]))
    
    return {
        nullifier: nullifier,
        secret: secret,
        commitment: commitment,
        nullifierHash: nullifierHash,
        inputTimestamp: timestamp
    }
}
export function calculateMerkleRootAndPath(mimc, levels, elements, element) {
    const capacity = 2 ** levels
    if (elements.length > capacity) throw new Error('Tree is full')

    const zeros = generateZeros(mimc, levels);
    let layers = []
    layers[0] = elements.slice()
    for (let level = 1; level <= levels; level++) {
        layers[level] = []
        for (let i = 0; i < Math.ceil(layers[level - 1].length / 2); i++) {
            layers[level][i] = calculateHash(
                mimc,
                layers[level - 1][i * 2],
                i * 2 + 1 < layers[level - 1].length ? layers[level - 1][i * 2 + 1] : zeros[level - 1],
            )
        }
    }
    const root = layers[levels].length > 0 ? layers[levels][0] : zeros[levels - 1]

    let pathElements = []
    let pathIndices = []

    if (element) {
        const bne = BigInt(element)
        let index = layers[0].findIndex(e => BigInt(e) === bne)
        // console.log('idx: ' + index)
        for (let level = 0; level < levels; level++) {
            pathIndices[level] = index % 2
            pathElements[level] = (index ^ 1) < layers[level].length ? layers[level][index ^ 1] : zeros[level]
            index >>= 1
        }
    }

    return {
        root: root.toString(),
        pathElements: pathElements.map((v) => v.toString()),
        pathIndices: pathIndices.map((v) => v.toString())
    }
}
const ZERO_VALUE = BigInt('21663839004416932945382355908790599225266501822907911457504978515578255421292') // = keccak256("tornado") % FIELD_SIZE

function calculateHash(mimc, left, right) {
    console.log()
    return mimc.F.toString(mimc.multiHash([left, right]))
}

export function generateZeros(mimc, levels) {
    let zeros = []
    zeros[0] = ZERO_VALUE
    for (let i = 1; i <= levels; i++)
        zeros[i] = mimc.F.toString(mimc.multiHash([zeros[i - 1], zeros[i - 1]]));
    return zeros
}