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

## <img align="left" width="28" height="28" src="https://raw.githubusercontent.com/worldcoin/world-id-docs/main/public/images/shared-readme/readme-orb.png" alt="" style="margin-right: 0;" /> About World ID

World ID is a protocol that lets you **prove a human is doing an action only once without revealing any personal data**. Stop bots, stop abuse.

World ID uses a device called the [Orb](https://worldcoin.org/how-the-launch-works) which takes a picture align="center" of a person's iris to verify they are a unique and alive human. The protocol uses [Zero-knowledge proofs](https://id.worldcoin.org/zkp) so no traceable information is ever public.

World ID is meant for on-chain web3 apps, traditional cloud applications, and even IRL verifications.

<div align="center">
  <picture align="center">
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/diagram-dark-1.png" />
    <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/diagram-light-1.png" />
    <img width="150px"  />
  </picture>

  <picture align="center">
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/diagram-dark-2.png" />
    <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/diagram-light-2.png" />
    <img width="150px"  />
  </picture>

  <picture align="center">
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/diagram-dark-3.png" />
    <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/diagram-light-3.png" />
    <img width="150px"  />
  </picture>

  <picture align="center">
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/diagram-dark-4.png" />
    <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/diagram-light-4.png" />
    <img width="150px"  />
  </picture>
</div>

### Getting started with World ID

Regardless of how you landed here, the easiest way to get started with World ID is through the the [Dev Portal](https://developer.worldcoin.org).

<a href="https://developer.worldcoin.org">
  <p align="center">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/get-started-dark.png" height="80px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/get-started-light.png" height="50px" />
      <img />
    </picture>
  </p>
</a>

### World ID Demos

Want to see World ID in action? We have a bunch of [Examples](https://id.worldcoin.org/examples).

<div dir="row" align="center">
  <a href="https://poap.worldcoin.org/">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/poap-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/poap-light.png" width="230px" />
      <img />
    </picture>
  </a>
  <a href="https://human.withlens.app/">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/lens-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/lens-light.png" width="230px" />
      <img />
    </picture>
  </a>
  <a href="https://github.com/worldcoin/world-id-discord-bot">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/discord-bot-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/discord-bot-light.png" width="230px" />
      <img />
    </picture>
  </a>
  <a href="https://github.com/worldcoin/hyperdrop-contracts">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/hyperdrop-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/hyperdrop-light.png" width="230px" />
      <img />
    </picture>
  </a>
  <a href="https://petorbz.com/">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/pet-orbz-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/pet-orbz-light.png" width="230px" />
      <img />
    </picture>
  </a>
  <a href="https://example.id.worldcoin.org/">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/examples/mesha-dark.png" width="230px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/examples/mesha-light.png" width="230px" />
      <img />
    </picture>
  </a>
</div>

## 📄 Documentation

We have comprehensive docs for World ID at https://id.worldcoin.org/docs.

<a href="https://id.worldcoin.org/docs">
  <p align="center">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/visit-documentation-dark.png" height="80px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/visit-documentation-light.png" height="50px" />
      <img />
    </picture>
  </p>
</a>

## 🗣 Feedback

**World ID is in Beta, help us improve!** Please share feedback on your experience. You can find us on [Discord](https://discord.gg/worldcoin), look for the [#world-id](https://discord.com/channels/956750052771127337/968523914638688306) channel. You can also open an issue or a PR directly on this repo.

<a href="https://discord.gg/worldcoin">
  <p align="center">
    <picture align="center">
      <source media="(prefers-color-scheme: dark)" srcset="./public/images/shared-readme/join-discord-dark.png" height="80px" />
      <source media="(prefers-color-scheme: light)" srcset="./public/images/shared-readme/join-discord-light.png" height="50px" />
      <img />
    </picture>
  </p>
</a>

<!-- WORLD-ID-SHARED-README-TAG:END -->
