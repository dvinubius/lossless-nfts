// deploy/00_deploy_your_contract.js

const fs = require("fs");
const { ethers } = require("hardhat");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // read in all the assets to get their IPFS hash...
  const uploadedAssets = JSON.parse(fs.readFileSync("./uploaded.json"));
  const bytes32Array = [];
  for (let a in uploadedAssets) {
    console.log(" 🏷 IPFS:", a);
    let bytes32 = ethers.utils.id(a);
    console.log(" #️⃣ hashed:", bytes32);
    bytes32Array.push(bytes32);
  }
  console.log(" \n");

  await deploy("Grabable", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [bytes32Array],
    log: true,
  });

  const grabable = await ethers.getContract("Grabable", deployer);
  const DEV_ADDRESS = "0x967752A2a06b0bD0519A08d496D988BcC6156CD7"; // localhost
  // const DEV_ADDRESS = "0x281f0d74Fa356C17E36603995e0f50D298d4a5A9"; // rinkeby
  const transfer = await grabable.transferOwnership(DEV_ADDRESS);

  // ToDo: Verify your contract with Etherscan for public chains
  // if (chainId !== "31337") {
  //   try {
  //     console.log(" 🎫 Verifing Contract on Etherscan... ");
  //     await sleep(15000); // wait 5 seconds for deployment to propagate
  //     await run("verify:verify", {
  //       address: soRadToken.address,
  //       contract: "contracts/SoRadToken.sol:SoRadToken",
  //       contractArguments: [],
  //     });
  //   } catch (e) {
  //     console.log(" ⚠️ Failed to verify contract on Etherscan ");
  //   }
  // }
};

module.exports.tags = ["Grabable"];
