const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

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

withdraw() 
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
