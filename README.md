# World ID Starter Kit (Smart Contracts)

**Easiest** way to get started with World ID **on-chain**. This repository contains the minimum requirements to build web3 dApps with [World ID](#-about-world-id), allowing you to easily add sybil-resistance and uniqueness features to your dApp.

> This repository contains the smart contract code, and is built with the [Foundry](https://getfoundry.sh) toolkit. We also have a Hardhat version in the [world-id-starter-hardhat](https://github.com/worldcoin/world-id-starter-hardhat) repository.

## 🏃 Getting started

Start with the `verifyAndExecute` function on the [`Contract.sol`](src/Contract.sol) file, which contains the basic World ID verification logic. You can rename this function as you choose (for example, we use `claim` on our airdrop example).

### Setting your Action ID

The action ID (also called "external nullifier") makes sure that the proof your contract receives was generated for it (more on [Action IDs](https://id.worldcoin.org/docs/about/glossary#action-id)). A sensible default is to use the address of your contract (which will always be unique), but feel free to update if you have a unique use-case. You should be changing the `abi.encodePacked(address(this)).hashToField()` line, updating the parameters inside the `encodePacked` call.

> **Note** Make sure you're passing the correct Action ID when initializing the JS widget! The generated proof will be invalid otherwise.

### Setting your signal

The signal adds an additional layer of protection to the World ID Proof, it makes sure that the input provided to the contract is the one the person who generated the proof intended (more on [signals](https://id.worldcoin.org/docs/about/glossary#signal)). By default this contract expects an address (`receiver`), but you can update it to be any arbitrary string.

To update the signal, you should change the `input` on the `abi.encodePacked(input).hashToField()` line. You should provide the exact same string when initializing the JS widget, to make sure the proof includes them.

> **Note** The `hashToField` part is really important, as validation will fail otherwise even with the right parameters. Make sure to include it!

### About nullifiers

_Nullifiers_ are what enforces uniqueness in World ID. You can generate multiple proofs for a given signal and action ID, but they will all have the same nullifier. Note how, in the `verifyAndExecute` function we first check if the given nullifier has already been used (and revert if so), then mark it as used after the proof is verified.

If your use-case doesn't require uniqueness, you can use them as "anonymous identifiers", linking users between different signals (for example, allowing them to change which address they've verified in a social network). To do this, update the `nullifierHashes` mapping to point to some sort of identifier instead of a boolean. See [this project](https://github.com/m1guelpf/lens-humancheck/blob/main/src/HumanCheck.sol) as an example.


## 🗝 Usage instructions

1. End users will need a verified identity, which can be obtained through our [Simulator](https://simulator.worldcoin.org) ([see docs for more info](https://id.worldcoin.org/test)). In production, this would be obtained by verifying with an orb.

2. Use the [JS widget](https://id.worldcoin.org/docs/js) to prompt the user with verification (make sure you're providing the correct [signal](#setting-your-signal) and [action ID](#setting-your-action-id)). Upon acceptance, you'll get a `merkle_root`, `nullifier_hash` and `proof`.

3. The ZKP (attribute `proof`) is a `uint256[8]` array and your smart contract expects it that way. For easier handling, the JS widget will return the proof encoded. Unpack your proof before sending it to your smart contract. 

```js
import { defaultAbiCoder as abi } from "@ethers/utils";
const unpackedProof = abi.decode(["uint256[8]"], proof)[0];
// You can now pass your unpackedProof to your smart contract
```

4. Use the obtained parameters, along with any inputs your contract needs (which [should be included in the signal](#setting-your-signal)), to call your smart contract!

## 🚀 Deployment

1. If you've added any parameters to your constructor or renamed the contract, you should update the `scripts/deploy.js` script accordingly.
2. Run `cp .env.example .env` to create your environment file, and add a `RPC_URL` for the network you want to deploy (we currently **only support the Polygon Mumbai Testnet**) and a `PRIVATE_KEY` for the deployer wallet.
3. Run `make deploy` to deploy your contract.

## 🧑‍💻 Development & testing

1. Install [Foundry](https://github.com/gakonst/foundry).
    ```
    curl -L https://foundry.paradigm.xyz | bash
    foundryup # run on a new terminal window; installs latest version
    ```
2. Install [Node.js](https://nodejs.org/en/) v16 or above (required for tests). We recommend [nvm](https://github.com/nvm-sh/nvm) if you use multiple node versions.
3. Install dependencies & build smart contracts
    ```
    make
    ```

> **Warning** Make sure you've run `make` instead of using Foundry directly! We need to build some of WorldID's dependencies in a specific way, and tests will fail otherwise.

### Running test suite

This repository includes automated tests, which you can use to make sure your contract is working as expected before deploying it. Of course, any modifications you've made to the `Contract.sol` file will need to be reflected on the tests as well to make them work.

If you've changed the type of the external nullifier, or the signal, you should look over the `src/test/helpers/InteractsWithWorldID.sol` and `src/test/scripts/generate-proof.js` to update them as well.

Once you've done this, you can run the tests,
```
make test
```


<!-- WORLD-ID-SHARED-README-TAG:START - Do not remove or modify this section directly -->
<!-- The contents of this file are inserted to all World ID repositories to provide general context on World ID. -->

## <img align="left" width="28" height="28" src="https://raw.githubusercontent.com/worldcoin/world-id-docs/main/public/images/shared-readme/readme-world-id.png" alt="" style="margin-right: 0; padding-right: 4px;" /> About World ID

World ID is the privacy-first identity protocol that brings global proof of personhood to the internet. More on World ID in the [announcement blog post](https://worldcoin.org/blog/announcements/introducing-world-id-and-sdk).

World ID lets you seamlessly integrate authentication into your app that verifies accounts belong to real persons through [Sign in with Worldcoin](https://docs.worldcoin.org/id/sign-in). For additional flexibility and cases where you need extreme privacy, [Anonymous Actions](https://docs.worldcoin.org/id/anonymous-actions) lets you verify users in a way that cannot be tracked across verifications.

Follow the [Quick Start](https://docs.worldcoin.org/quick-start) guide for the easiest way to get started.

## 📄 Documentation

All the technical docs for the Wordcoin SDK, World ID Protocol, examples, guides can be found at https://docs.worldcoin.org/

<a href="https://docs.worldcoin.org">
  <p align="center">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/worldcoin/world-id-docs/main/public/images/shared-readme/visit-documentation-dark.png" height="50px" />
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/worldcoin/world-id-docs/main/public/images/shared-readme/visit-documentation-light.png" height="50px" />
      <img />
    </picture>
  </p>
</a>

<!-- WORLD-ID-SHARED-README-TAG:END -->
