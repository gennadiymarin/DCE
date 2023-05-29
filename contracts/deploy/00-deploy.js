const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("----------------------------------------------------");
    log("Deploying mocks!");

    args = [];

    const contract = await deploy("LiquidityPool", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("Mocks deployed!");
    log("----------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
