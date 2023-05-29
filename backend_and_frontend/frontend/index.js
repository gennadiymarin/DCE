import { ethers } from "./ethres-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const createPoolButton = document.getElementById("createPoolButton")

connectButton.onclick = connect
createPoolButton.onclick = CreatePool
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({method: "eth_requestAccounts"})
        connectButton.innerHTML = "Wallet connected"
    } else {
        connectButton.innerHTML = "No wallet"
    }
}

async function CreatePool() {
    const ethAmount = document.getElementById("ethAmount").value
    const nfts_addresses_string = document.getElementById("NFTaddress").value
    const collection_address = document.getElementById("CollectionAddress").value
    if (typeof window.ethereum !== "undefined") {
        var nfts_ids = nfts_addresses_string.split(" ").map(Number)
        console.log(nfts_ids)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
          const transactionResponse = await contract.CreatePool(collection_address, nfts_ids, 
            ethers.utils.parseEther(ethAmount))
          await listenForTransactionMine(transactionResponse, provider)
        } catch(error) {
          console.log(error)
        }
    } else {
        createPoolButton.innerHTML = "Connect wallet"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const transactionResponse = await contract.withdrawProceeds()
        await listenForTransactionMine(transactionResponse, provider)
        // await transactionResponse.wait(1)
      } catch (error) {
        console.log(error)
      }
    } else {
      withdrawButton.innerHTML = "Connect wallet"
    }
  }

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install wallet"
  }
}

async function ClosePool() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("Item Canceled!")
    if ((network.config.chainId == "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

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
