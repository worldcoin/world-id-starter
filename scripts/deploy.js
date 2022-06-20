import fs from "fs";
import ora from "ora";
import dotenv from "dotenv";
import readline from "readline";
import { Wallet } from "@ethersproject/wallet";
import { hexlify, concat } from "@ethersproject/bytes";
import { JsonRpcProvider } from "@ethersproject/providers";
import { defaultAbiCoder as abi } from "@ethersproject/abi";
dotenv.config();

// make sure to fix the path if you've renamed your contract!
const Contract = fs.readFileSync("./out/Contract.sol/Contract.json");

let validConfig = true;
if (process.env.RPC_URL === undefined) {
  console.log("Missing RPC_URL");
  validConfig = false;
}
if (process.env.PRIVATE_KEY === undefined) {
  console.log("Missing PRIVATE_KEY");
  validConfig = false;
}
if (!validConfig) process.exit(1);

const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

const ask = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (input) => {
      resolve(input);
      rl.close();
    });
  });
};

async function main() {
  const worldIDAddress = await fetch(
    "https://developer.worldcoin.org/api/v1/contracts"
  )
    .then((res) => res.json())
    .then(
      (res) => res.find(({ key }) => key == "staging.semaphore.wld.eth").value
    );

  let inputs = [];
  // if you need any constructor parameters, use this to get them when running the script:
  // inputs = [await ask("Param1: "), await ask("Param2: ")];

  const spinner = ora(`Deploying your contract...`).start();

  let tx = await wallet.sendTransaction({
    data: hexlify(
      concat([
        Contract.bytecode.object,
        abi.encode(Contract.abi[0].inputs, [worldIDAddress, ...inputs]),
      ])
    ),
    gasPrice: 60000000000,
  });

  spinner.text = `Waiting for deploy transaction (tx: ${tx.hash})`;
  tx = await tx.wait();

  spinner.succeed(`Deployed your contract to ${tx.contractAddress}`);
}

main(...process.argv.splice(2)).then(() => process.exit(0));
