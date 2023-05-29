export const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
export const abi = [
    {
      "inputs": [],
      "name": "AlreadyReleased",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoIncome",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "nft_id",
          "type": "uint256"
        }
      ],
      "name": "NotApprovedForPool",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnoughEth",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PriceMustBeAboveZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PriceMustBeTheSame",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        }
      ],
      "name": "EthProvided",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "NftsBuy",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "NftsSell",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        }
      ],
      "name": "PoolClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "nft_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "eth_amount",
          "type": "uint256"
        }
      ],
      "name": "PoolCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price_per_nft",
          "type": "uint256"
        }
      ],
      "name": "PoolPrice",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BuyNfts",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        }
      ],
      "name": "ClosePool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "nft_token_ids",
          "type": "uint256[]"
        }
      ],
      "name": "CreatePool",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "nft_token_ids",
          "type": "uint256[]"
        }
      ],
      "name": "SellNfts",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "buy",
          "type": "bool"
        }
      ],
      "name": "getPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawProceeds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
