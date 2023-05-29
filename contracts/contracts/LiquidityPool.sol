// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// send NFTs
// wait for eth
// create pool
// one persone gives nfts

error PriceMustBeAboveZero();
error NotApprovedForPool(uint256 nft_id);
error NotOwner();
error NotEnoughEth();
error NotEnoughNfts();
error AlreadyProvided();
error AlreadyReleased();
error NotReleased();
error NoIncome();
error PriceMustBeTheSame();
error NotEnoughNftsInPool();

contract LiquidityPool is ReentrancyGuard, ERC721Holder {
    event PoolCreated(
        address seller,
        address nft_address,
        uint256 nft_amount,
        uint256 eth_amount
    );
    event PoolClosed(address nft_address);
    event EthProvided(address nft_address, address provider);
    event PoolPrice(address nft_address, uint256 price_per_nft);
    event NftsBuy(address nft_address, uint256[] nfts_id);
    event NftsSell(address nft_address, uint256 amount);

    struct Pool {
        address pool_creator;
        address nft_adderess;
        uint256[] nft_token_ids;
        uint256 eth_amount;
        bool released;
    }

    mapping(address => Pool) private pools;
    mapping(address => uint256) private earned;

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Modifiers ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    modifier isApproved(address nft_address, uint256[] calldata nft_token_ids) {
        for (uint256 i = 0; i < nft_token_ids.length; i++) {
            if (
                IERC721(nft_address).getApproved(nft_token_ids[i]) !=
                address(this)
            ) {
                revert NotApprovedForPool(nft_token_ids[i]);
            }
        }
        _;
    }

    modifier isOwned(
        address nft_address,
        uint256[] calldata nft_token_ids,
        address spender
    ) {
        for (uint256 i = 0; i < nft_token_ids.length; i++) {
            if (IERC721(nft_address).ownerOf(nft_token_ids[i]) != spender) {
                revert NotOwner();
            }
        }
        _;
    }

    modifier isPoolOwner(address nft_address, address user) {
        if (pools[nft_address].pool_creator != user) {
            revert NotOwner();
        }
        _;
    }

    modifier isReleased(address nft_address) {
        if (!pools[nft_address].released) {
            revert NotReleased();
        }
        _;
    }

    modifier notReleased(address nft_address) {
        if (pools[nft_address].released) {
            revert AlreadyReleased();
        }
        _;
    }

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// External Functions //////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    function CreatePool(
        address nft_address,
        uint256[] calldata nft_token_ids
    )
        external
        payable
        nonReentrant
        notReleased(nft_address)
        isApproved(nft_address, nft_token_ids)
        isOwned(nft_address, nft_token_ids, msg.sender)
    {
        if (msg.value <= 0) {
            revert PriceMustBeAboveZero();
        }
        if (
            (msg.value / nft_token_ids.length) * nft_token_ids.length !=
            msg.value
        ) {
            revert PriceMustBeTheSame();
        }
        for (uint256 i = 0; i < nft_token_ids.length; i++) {
            IERC721(nft_address).safeTransferFrom(
                msg.sender,
                address(this),
                nft_token_ids[i]
            );
        }
        pools[nft_address] = Pool(
            msg.sender,
            nft_address,
            nft_token_ids,
            msg.value,
            true
        );
        emit PoolCreated(
            msg.sender,
            nft_address,
            nft_token_ids.length,
            msg.value
        );
    }

    function ClosePool(
        address nft_address
    )
        external
        nonReentrant
        isReleased(nft_address)
        isPoolOwner(nft_address, msg.sender)
    {
        for (uint256 i = 0; i < pools[nft_address].nft_token_ids.length; i++) {
            IERC721(nft_address).safeTransferFrom(
                address(this),
                msg.sender,
                pools[nft_address].nft_token_ids[i]
            );
        }
        delete pools[nft_address];
        (bool success, ) = payable(msg.sender).call{
            value: pools[nft_address].eth_amount
        }("");
        require(success, "Transfer failed");
        emit PoolClosed(nft_address);
    }

    function BuyNfts(
        address nft_address,
        uint256 amount
    ) external payable nonReentrant isReleased(nft_address) {
        if (amount >= pools[nft_address].nft_token_ids.length) {
            revert NotEnoughNftsInPool();
        }
        uint256 price = RecalculatePrice(nft_address, amount, true);
        if (msg.value < price + totalCommission(price)) {
            revert NotEnoughEth();
        }
        returnExtraMoney(msg.sender, price + totalCommission(price), msg.value);
        pools[nft_address].eth_amount += price;
        uint256[] memory nfts_id = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            uint256 len = pools[nft_address].nft_token_ids.length - 1;
            IERC721(nft_address).safeTransferFrom(
                address(this),
                msg.sender,
                pools[nft_address].nft_token_ids[len]
            );
            nfts_id[i] = pools[nft_address].nft_token_ids[len];
            pools[nft_address].nft_token_ids.pop();
        }
        sendCommision(pools[nft_address].pool_creator, price);
        emit NftsBuy(nft_address, nfts_id);
    }

    function SellNfts(
        address nft_address,
        uint256[] calldata nft_token_ids
    )
        external
        isReleased(nft_address)
        isApproved(nft_address, nft_token_ids)
        isOwned(nft_address, nft_token_ids, msg.sender)
    {
        uint256 price = RecalculatePrice(
            nft_address,
            nft_token_ids.length,
            false
        );
        pools[nft_address].eth_amount -= price;
        for (uint256 i = 0; i < nft_token_ids.length; i++) {
            IERC721(nft_address).safeTransferFrom(
                msg.sender,
                address(this),
                nft_token_ids[i]
            );
            pools[nft_address].nft_token_ids.push(nft_token_ids[i]);
        }

        (bool success, ) = payable(msg.sender).call{
            value: price - totalCommission(price)
        }("");
        require(success, "Transfer failed");
        sendCommision(pools[nft_address].pool_creator, price);
        emit NftsSell(nft_address, nft_token_ids.length);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 income = earned[msg.sender];
        if (income <= 0) {
            revert NoIncome();
        }
        earned[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: income}("");
        require(success, "Transfer failed");
    }

    function getBalance(address user) external view returns (uint256) {
        return earned[user];
    }

    function getPrice(
        address nft_address,
        uint256 amount,
        bool buy
    ) external view returns (uint256) {
        if (buy && amount >= pools[nft_address].nft_token_ids.length) {
            revert NotEnoughNftsInPool();
        }
        uint256 price = RecalculatePrice(nft_address, amount, buy);
        if (buy) {
            return price + totalCommission(price);
        }
        return price - totalCommission(price);
    }

    function getPoolEthAmount(
        address nft_address
    ) external view returns (uint256) {
        return pools[nft_address].eth_amount;
    }

    function getPoolNftsAmount(
        address nft_address
    ) external view returns (uint256) {
        return pools[nft_address].nft_token_ids.length;
    }

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Help Functions //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    function RecalculatePrice(
        address nft_address,
        uint256 dn,
        bool buy
    ) private view returns (uint256) {
        uint256 n = pools[nft_address].nft_token_ids.length;
        uint256 k = pools[nft_address].eth_amount;
        if (buy) {
            return (k * dn) / (n - dn);
        }
        return (k * dn) / (n + dn);
    }

    function totalCommission(
        uint256 total_price
    ) private pure returns (uint256) {
        return total_price / 400;
    }

    function poolCommission(
        uint256 total_price
    ) private pure returns (uint256) {
        return totalCommission(total_price) / 2;
    }

    function returnExtraMoney(
        address sender,
        uint256 required,
        uint256 got
    ) private {
        if (got > required) {
            (bool success, ) = payable(sender).call{value: got - required}("");
            require(success, "Extra money returning failed");
        }
    }

    function sendCommision(address pool_creator, uint256 price) private {
        earned[pool_creator] += poolCommission(price);
        earned[address(this)] += totalCommission(price) - poolCommission(price);
    }
}
