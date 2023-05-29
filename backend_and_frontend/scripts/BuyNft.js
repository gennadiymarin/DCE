const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1
const AMOUNT = 1

async function BuyNft() {
    const DSM = await ethers.getContract("DSM")
    const basicNft = await ethers.getContract("BasicItem")
    const listing = await DSM.getPrice(basicNft.address, TOKEN_ID, AMOUNT)
    const price = listing.price.toString()
    const tx = await DSM.BuyNfts(basicNft.address, TOKEN_ID, { value: price })
    await tx.wait(1)
    console.log("Item Bought!")
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
