# World ID Starter Kit (Smart Contracts)

**Easiest** way to get started with World ID **on-chain**. This repository contains the bare minimum requirements to build apps with [World ID](https://id.worlcoin.org), allowing you to easily add sybil-resistance and uniqueness features to your dApp.

This repository contains the smart contract code, and is built with the [Foundry](https://getfoundry.sh) toolkit. We also have a Hardhat version in the [world-id-starter-hardhat](https://github.com/worldcoin/world-id-starter-hardhat) repository.

## 🗝 How to use

Start with the `verifyAndExecute` function on the [`Contract.sol`](src/Contract.sol) file, which contains the basic World ID verification logic. You can rename this function as you choose (for example, we use `claim` on our airdrop example).

### Setting your Action ID

The action ID (also called "external nullifier") makes sure that the proof your contract receives was generated for it (more on [Action IDs](https://id.worldcoin.org/docs/about/glossary#action-id)). A sensible default is to use the address of your contract (which will always be unique), but feel free to update if you have a unique use-case. You should be changing the `abi.encodePacked(address(this)).hashToField()` line, updating the parameters inside the `encodePacked` call.

> Note: Make sure you're passing the correct Action ID when initializing the JS widget! The generated proof will be invalid otherwise.

### Setting your signal

The signal adds an additional layer of protection to the World ID Proof, it makes sure that the input provided to the contract is the one the person who generated the proof intended (more on [signals](https://id.worldcoin.org/docs/about/glossary#signal)). By default this contract expects an address (`receiver`), but you can update it to be any arbitrary string.

To update the signal, you should change the `input` on the `abi.encodePacked(input).hashToField()` line. You should provide the exact same string when initializing the JS widget, to make sure the proof includes them.

> Note: The `hashToField` part is really important, as validation will fail otherwise even with the right parameters. Make sure to include it!

### About nullifiers

_Nullifiers_ are what enforces uniqueness in World ID. You can generate multiple proofs for a given signal and action ID, but they will all have the same nullifier. Note how, in the `verifyAndExecute` function we first check if the given nullifier has already been used (and revert if so), then mark it as used after the proof is verified.

If your use-case doesn't require uniqueness, you can use them as "anonymous identifiers", linking users between different signals (for example, allowing them to change which address they've verified in a social network). To do this, update the `nullifierHashes` mapping to point to some sort of identifier instead of a boolean. See [this project](https://github.com/m1guelpf/lens-humancheck/blob/main/src/HumanCheck.sol) as an example.

## 🚀 Deployment

1. If you've added any parameters to your constructor or renamed the contract, you should update the `scripts/deploy.js` script accordingly.
2. Run `cp .env.example .env` to create your environment file, and add a `RPC_URL` for the network you want to deploy (we currently **only support the Polygon Mumbai Testnet**) and a `PRIVATE_KEY` for the deployer wallet.
3. Run `make deploy` to deploy your contract.

## 🧑‍💻 Development & testing

This repository uses the [Foundry](https://github.com/gakonst/foundry) smart contract toolkit. You can download the Foundry installer by running `curl -L https://foundry.paradigm.xyz | bash`, and then install the latest version by running `foundryup` on a new terminal window (additional instructions are available [on the Foundry repo](https://github.com/gakonst/foundry#installation)). You'll also need [Node.js](https://nodejs.org) if you're planning to run the automated tests.

Once you have everything installed, you can run `make` from the base directory to install all dependencies, and build the smart contracts.

> Note: Make sure you've run `make` instead of using Foundry directly! We need to build some of WorldID's dependencies in a specific way, and tests will fail otherwise.

### Running the tests

This repository includes automated tests, which you can use to make sure your contract is working as expected before deploying it. Of course, any modifications you've made to the `Contract.sol` file will need to be reflected on the tests as well to make them work.

If you've changed the type of the external nullifier, or the signal, you should look over the `src/test/helpers/InteractsWithWorldID.sol` and `src/test/scripts/generate-proof.js` to update them as well.

Once you've done this, you can run the tests with `make test`.


<!-- WORLD-ID-SHARED-README-TAG:START - Do not remove or modify this section directly -->
<!-- WORLD-ID-SHARED-README-TAG:END -->