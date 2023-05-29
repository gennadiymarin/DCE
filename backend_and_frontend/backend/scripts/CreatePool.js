const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

async function CreatePool() {
    const DSM = await ethers.getContract("LiquidityPool")
    const basicNft = await ethers.getContract("BasicNft")

    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving...")

    const approvalTx = await basicNft.approve(DSM.address, tokenId, {value: PRICE})
    await approvalTx.wait(1)
    console.log("Pool preparing...")
    const tx = await DSM.CreatePool(basicNft.address, tokenId, {value: PRICE})
    await tx.wait(1)
    console.log("Pool created")
}

CreatePool() 
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
