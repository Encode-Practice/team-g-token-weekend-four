import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/TeamG.json";

const EXPOSED_KEY = "taco";

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  //checking args are present
  if (process.argv.length < 3) throw new Error("Token address missing");
  const tokenAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("To address missing");
  const toAddress = process.argv[3];
  if (process.argv.length < 4) throw new Error("URI address missing");
  const uriAddress = process.argv[4];
  console.log({ tokenAddress, toAddress, uriAddress });
  console.log(`Attaching token contract to address ${tokenAddress}`);

  const tokenContract = new Contract(tokenAddress, tokenJson.abi, signer);

  const tx = await tokenContract.safeMint(toAddress, uriAddress);

  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
