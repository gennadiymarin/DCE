const networkConfig = {
    31337: {
        name: "localhost",
    },
    11155111: {// Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}