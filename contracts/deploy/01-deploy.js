const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // const chainId = network.config.chainId;

  log("----------------------------------------------------");
  log("Deploying LiquidityPool contract and waiting for confirmations...");

  const args = [];
  const LPContract = await deploy("LiquidityPool", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`LiquidityPool contract deployed at ${LPContract.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(contract.address, args);
  }

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "liquidityPool"];
