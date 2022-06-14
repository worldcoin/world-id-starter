import fs from 'fs'
import { keccak256, pack } from '@ethersproject/solidity'
import { ZkIdentity, Strategy } from '@zk-kit/identity'
import { defaultAbiCoder as abi } from '@ethersproject/abi'
import { Semaphore, generateMerkleProof } from '@zk-kit/protocols'

const verificationKey = JSON.parse(
    fs.readFileSync(
        './lib/world-id-example-airdrop/lib/semaphore/build/snark/verification_key.json'
    )
)

function hashBytes(signal) {
    return BigInt(keccak256(['bytes'], [signal])) >> BigInt(8)
}

function generateSemaphoreWitness(
    identityTrapdoor,
    identityNullifier,
    merkleProof,
    externalNullifier,
    signal
) {
    return {
        identityNullifier: identityNullifier,
        identityTrapdoor: identityTrapdoor,
        treePathIndices: merkleProof.pathIndices,
        treeSiblings: merkleProof.siblings,
        externalNullifier: externalNullifier,
        signalHash: hashBytes(signal),
    }
}

// update the parameters here if changing the signal
async function main(signalAddress, externalNullifierAddress) {
    const identity = new ZkIdentity(Strategy.MESSAGE, 'test-identity')
    const identityCommitment = identity.genIdentityCommitment()

    const witness = generateSemaphoreWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        generateMerkleProof(20, BigInt(0), [identityCommitment], identityCommitment),
        hashBytes(externalNullifierAddress),
        // update here if changing the signal (you might need to wrap in a `pack()` call if multiple arguments)
        signalAddress
    )

    const { proof, publicSignals } = await Semaphore.genProof(
        witness,
        './lib/world-id-example-airdrop/lib/semaphore/build/snark/semaphore.wasm',
        './lib/world-id-example-airdrop/lib/semaphore/build/snark/semaphore_final.zkey'
    )

    await Semaphore.verifyProof(verificationKey, { proof, publicSignals }).then(isValid => {
        if (!isValid) console.error('Generated proof failed to verify')
    })

    process.stdout.write(
        abi.encode(
            ['uint256', 'uint256[8]'],
            [publicSignals.nullifierHash, Semaphore.packToSolidityProof(proof)]
        )
    )
}

main(...process.argv.splice(2)).then(() => process.exit(0))
