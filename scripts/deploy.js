import fs from "fs";
import ora from "ora";
import dotenv from "dotenv";
import readline from "readline";
import { polygonMumbai } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { http, createWalletClient, createPublicClient } from "viem";
dotenv.config();

// make sure to fix the path if you've renamed your contract!
const Contract = JSON.parse(
	fs.readFileSync("./out/Contract.sol/Contract.json", "utf-8")
);

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

const wallet = createWalletClient({
	transport: http(process.env.RPC_URL),
	account: privateKeyToAccount(process.env.PRIVATE_KEY),
});
const client = createPublicClient({ transport: http(process.env.RPC_URL) });

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

	// if you need any extra constructor parameters, add them to this array in order
	const inputs = [await ask("App ID: "), await ask("Action: ")];

	const spinner = ora(`Deploying your contract...`).start();

	const hash = await wallet.deployContract({
		abi: Contract.abi,
		chain: polygonMumbai,
		args: [worldIDAddress, ...inputs],
		bytecode: Contract.bytecode.object,
	});

	spinner.text = `Waiting for deploy transaction (tx: ${hash})`;
	const tx = await client.waitForTransactionReceipt({ hash });

	spinner.succeed(`Deployed your contract to ${tx.contractAddress}`);
}

main(...process.argv.splice(2)).then(() => process.exit(0));
