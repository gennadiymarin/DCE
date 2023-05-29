const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying BasicNft contract and waiting for confirmations...");

  const args = [];
  const contract = await deploy("BasicNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(contract.address, args);
  }
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "basicNft"];
