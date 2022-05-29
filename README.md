# World ID Starter Kit (Smart Contracts)

This repository contains the bare minimum required to build apps with [World ID](https://id.worlcoin.org), allowing you to add sybil-resistance and uniqueness features to your dApp in minutes instead of months.

> World ID is a mechanism to verify a single human has performed a specific action only once without exposing any personal information.

This repository contains the smart contract code, and is built with the [Foundry](https://getfoundry.sh) toolkit. We'll share additional starter kits for other toolkits (like hardhat) soon!

## 📄 Documentation

Start with the `verifyAndExecute` function on the [`Contract.sol`](src/Contract.sol) file, which contains the basic World ID logic. You can rename this function as you choose (for example, we use `claim` on our airdrop example).

### Updating the signal

The input accepted by this contract is an address (`receiver`) by default, but you can update it to be as many parameters as you need, of any type.

Next, you'll need to update the `signal`. The signal provides the "uniqueness" part of World ID, as it ensures your contract will only accept one proof per person-signal combination, and it makes sure that the input provided to the contract is the one the person who generated the proof intended.

To update the signal, you should change the `abi.encodePacked(input).hashToField()` line to include all your parameters inside the `encodePacked` call. For example, if I wanted not only a receiver receiver but also an `uint256` id, I'd use `abi.encodePacked(receiver, id).hashToField()`. You should provide these same parameters when initializing the JavaScript SDK, to make sure the proof includes them.

> Note: The `hashToField` part is really important, as validation will fail otherwise even with the right parameters. Make sure to include it!

### Updating the external nullifier

The external nullifier makes sure that the proof your contract receives was generated for it, and not for a different contract using the same signal. A sensible default is to use the address of your contract (which will always be unique), but feel free to update if you have a unique use-case. You should be changing the `abi.encodePacked(address(this)).hashToField()` line, updating the parameters inside the `encodePacked` call.

> Note: Make sure you're passing the correct external nullifier when initializing the JavaScript SDK! The generated proof will be invalid otherwise.

### About nullifiers

_Nullifiers_ are what enforces uniqueness in World ID. You can generate multiple proofs for a given signal and external nullifier, but they will all have the same nullifier. Note how, in the `verifyAndExecute` function we first check if the given nullifier has already been used (and revert if so), then mark it as used after the proof is verified.

If your use-case doesn't require uniqueness, you can use them as "anonymous identifiers", linking users between different signals (for example, allowing them to change which address they've verified in a social network). To do this, update the `nullifierHashes` mapping to point to some sort of identifier instead of a boolean. See [this project](https://github.com/m1guelpf/lens-humancheck/blob/main/src/HumanCheck.sol) as an example.

## 🚀 Deployment

First, if you've added any parameters to your constructor or renamed the contract, you should update the `scripts/deploy.js` script accordingly. Then, run `cp .env.example .env` to create your environment file, and add a `RPC_URL` for the network you want to deploy (we currently only support the Polygon Mumbai Testnet) and a `PRIVATE_KEY` for the deployer wallet. Finally, run `make deploy` to deploy your contract.

## 🗝 Usage instructions

1. End users will need a verified identity, which can be obtained through our [identity faucet](https://mock-app.id.worldcoin.org) ([see docs for more info](https://id.worldcoin.org/test)). In production, this would be obtained by verifying with an orb.

2. Use the [WorldID JavaScript SDK](https://id.worldcoin.org/docs/js) to prompt the user with verification (make sure you're providing the correct [signal](#updating-the-signal) and [external nullifier](#updating-the-external-nullifier)). Upon acceptance, you'll get a `merkleRoot`, `nullifierHash` and `proof`.

3. Use the obtained parameters, along with any inputs your contract needs (which [should be included in the signal](#updating-the-signal)), to call your smart contract!

## 🧑‍💻 Development & testing

This repository uses the [Foundry](https://github.com/gakonst/foundry) smart contract toolkit. You can download the Foundry installer by running `curl -L https://foundry.paradigm.xyz | bash`, and then install the latest version by running `foundryup` on a new terminal window (additional instructions are available [on the Foundry repo](https://github.com/gakonst/foundry#installation)). You'll also need [Node.js](https://nodejs.org) if you're planning to run the automated tests.

Once you have everything installed, you can run `make` from the base directory to install all dependencies, and build the smart contracts.

> Note: Make sure you've run `make` instead of using Foundry directly! We need to build some of WorldID's dependencies in a specific way, and tests will fail otherwise.

### Running the tests

This repository includes automated tests, which you can use to make sure your contract is working as expected before deploying it. Of course, any modifications you've made to the `Contract.sol` file will need to be reflected on the tests as well to make them work.

If you've changed the type of the external nullifier, or the signal, you should look over the `src/test/helpers/InteractsWithWorldID.sol` and `src/test/scripts/generate-proof.js` to update them as well.

Once you've done this, you can run the tests with `make test`.

## 🧑‍⚖️ License

This repository is licensed under the MIT License. For more information, check the [license file](LICENSE).
