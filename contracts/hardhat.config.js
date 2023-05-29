require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        localhost:{                                         //for hardhat node
          url: "http://127.0.0.1:8545/",
          chainId: 31337,
        }
        // sepolia: {
        //     url: SEPOLIA_RPC_URL,
        //     accounts: [PRIVATE_KEY],
        //     chainId: 11155111,
        //     blockConfirmations: 6,
        // },
    },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    }
  },
};
