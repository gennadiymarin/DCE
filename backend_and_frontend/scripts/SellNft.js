const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1
const AMOUNT = 1

async function SellNft() {
    const DSM = await ethers.getContract("LiquidityPool")
    const basicNft = await ethers.getContract("BasicNft")
    const listing = await DSM.getPrice(basicNft.address, TOKEN_ID, AMOUNT)
    const price = listing.price.toString()
    const tx = await DSM.SellNfts(basicNft.address, TOKEN_ID, { value: price })
    await tx.wait(1)
    console.log("NFT Bought!")
    if ((network.config.chainId == "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
