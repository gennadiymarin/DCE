const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");

describe("LiquidityPool", function () {
  let LPContract, LP, basicNftContract, basicNft;
  let deployer;
  const NFTS_AMOUNT = 50;
  const PRICE = ethers.utils.parseEther("10");
  // const PRICE = 5000
  let nfts_id = [];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];
    await deployments.fixture(["all"]);
    LPContract = await ethers.getContract("LiquidityPool");
    LP = LPContract.connect(deployer);
    basicNftContract = await ethers.getContract("BasicNft");
    basicNft = basicNftContract.connect(deployer);
    nfts_id = [];
    for (let i = 0; i < NFTS_AMOUNT; i++) {
      await basicNft.mintNft();
      await basicNft.approve(LPContract.address, i); //basic_nft_token_id == mint_number
      nfts_id.push(i);
    }
  });

  describe("CreatePool", function () {
    it("emits an event when pool is created", async function () {
      expect(
        await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE })
      ).to.emit("PoolCreated");
    });
    it("revert if creating pool with existing nft", async () => {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      basicNft.mintNft();
      await expect(
        LP.CreatePool(basicNft.address, [NFTS_AMOUNT])
      ).to.be.rejectedWith("AlreadyReleased");
    });
    it("revert if price per each nft less than 1", async function () {
      await expect(
        LP.CreatePool(basicNft.address, nfts_id, { value: "0" })
      ).to.be.rejectedWith("PriceMustBeAboveZero");
    });
    it("revert if price per each nft isnt same", async function () {
      await expect(
        LP.CreatePool(basicNft.address, nfts_id, { value: "80" })
      ).to.be.rejectedWith("PriceMustBeTheSame");
    });
    it("only owners can create pools", async function () {
      LP = LPContract.connect(user);
      await expect(
        LP.CreatePool(basicNft.address, nfts_id, { value: PRICE })
      ).to.be.rejectedWith("NotOwner");
    });
    it("nfts should be approved for pools", async function () {
      basicNft.approve(ethers.constants.AddressZero, 4);
      await expect(
        LP.CreatePool(basicNft.address, nfts_id, { value: PRICE })
      ).to.be.rejectedWith("NotApproved");
    });
    it("ETH and NFTs were transfered", async function () {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });

      const pool_eth_amount = await LP.getPoolEthAmount(basicNft.address);
      const pool_nfts_amount = await LP.getPoolNftsAmount(basicNft.address);
      assert.equal(pool_eth_amount.toString(), PRICE.toString());
      assert.equal(pool_nfts_amount.toString(), NFTS_AMOUNT.toString());
    });
  });
  describe("ClosePool", function () {
    it("emits an event when pool closed", async function () {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      expect(await LP.ClosePool(basicNft.address)).to.emit("PoolClosed");
    });
    it("reverts if pool isnt created", async function () {
      await expect(
        LP.ClosePool(basicNft.address)
      ).to.be.revertedWithCustomError(LP, "NotReleased");
    });
    it("exclusively called by an owner", async function () {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      LP = await LPContract.connect(user);
      await expect(
        LP.ClosePool(basicNft.address)
      ).to.be.revertedWithCustomError(LP, "NotOwner");
    });

    it("all assets were returned", async () => {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });

      const deployer_balance_before = await ethers.provider.getBalance(
        deployer.address
      );

      const transaction_response = await LP.ClosePool(basicNft.address);
      const transaction_receipt = await transaction_response.wait();
      const { gasUsed, effectiveGasPrice } = transaction_receipt;
      const gas_cost = gasUsed.mul(effectiveGasPrice);

      const pool_eth_amount_after = await LP.getPoolEthAmount(basicNft.address);
      const pool_nfts_amount_after = await LP.getPoolNftsAmount(
        basicNft.address
      );
      assert.equal(pool_eth_amount_after, 0);
      assert.equal(pool_nfts_amount_after, 0);

      const deployer_balance_after = await ethers.provider.getBalance(
        deployer.address
      );
      assert.equal(
        deployer_balance_before.toString(),
        deployer_balance_after.add(gas_cost).toString()
      );

      for (let i = 0; i < NFTS_AMOUNT; i++) {
        const owner = await basicNft.ownerOf(i);
        assert.equal(owner, deployer.address);
      }
    });
  });
  describe("BuyNfts", function () {
    let price;
    const BUY_NFTS = 3;
    beforeEach(async () => {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      price = await LP.getPrice(basicNft.address, BUY_NFTS, true);
    });
    it("emits an event when nfts were bought", async function () {
      expect(
        await LP.BuyNfts(basicNft.address, BUY_NFTS, { value: price })
      ).to.emit("NftsBuy");
    });
    it("revert if pool isnt created", async () => {
      await expect(
        LP.BuyNfts(ethers.constants.AddressZero, 0)
      ).to.be.revertedWithCustomError(LP, "NotReleased");
    });
    it("revert if wanted to buy more nfts then in pool", async () => {
      await expect(
        LP.BuyNfts(basicNft.address, NFTS_AMOUNT + 1)
      ).to.be.rejectedWith("NotEnoughNftsInPool");
    });
    it("revert if doesnt match price", async () => {
      await expect(
        LP.BuyNfts(basicNft.address, BUY_NFTS, { value: price.sub(1) })
      ).to.be.rejectedWith("NotEnoughEth");
    });
    it("extra money were returned", async () => {
      const deployer_balance_before = await ethers.provider.getBalance(
        deployer.address
      );

      const transaction_response = await LP.BuyNfts(
        basicNft.address,
        BUY_NFTS,
        { value: price.add(10) }
      );
      const transaction_receipt = await transaction_response.wait();
      const { gasUsed, effectiveGasPrice } = transaction_receipt;
      const gas_cost = gasUsed.mul(effectiveGasPrice);

      const deployer_balance_after = await ethers.provider.getBalance(
        deployer.address
      );
      assert.equal(
        deployer_balance_before.toString(),
        deployer_balance_after.add(gas_cost).add(price).toString()
      );
    });
    it("assets were transefered", async () => {
      await LP.BuyNfts(basicNft.address, BUY_NFTS, { value: price });
      for (let i = NFTS_AMOUNT; i > NFTS_AMOUNT - BUY_NFTS; i--) {
        const owner = await basicNft.ownerOf(i - 1);
        assert.equal(owner, deployer.address);
      }
    });
  });
  describe("SellNfts", function () {
    const SELL_NFT = 3;
    let price,
      local_nfts_id = [];
    beforeEach(async () => {
      local_nfts_id = [];
      for (i = 0; i < SELL_NFT; i++) {
        await basicNft.mintNft();
        await basicNft.approve(LPContract.address, i + NFTS_AMOUNT); //basic_nft_token_id == mint_number
        local_nfts_id.push(i + NFTS_AMOUNT);
      }
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      price = await LP.getPrice(basicNft.address, SELL_NFT, false);
    });
    it("emits an event when nfts were sold", async function () {
      expect(await LP.SellNfts(basicNft.address, local_nfts_id)).to.emit(
        "NftsSell"
      );
    });
    it("revert if pool isnt created", async () => {
      await expect(
        LP.SellNfts(ethers.constants.AddressZero, local_nfts_id)
      ).to.be.revertedWithCustomError(LP, "NotReleased");
    });
    it("revert if nfts not approved", async () => {
      basicNft.approve(ethers.constants.AddressZero, local_nfts_id[0]);
      await expect(
        LP.SellNfts(basicNft.address, local_nfts_id)
      ).to.be.rejectedWith("NotApproved");
    });
    it("revert if nfts not owned", async () => {
      LP = LPContract.connect(user);
      await expect(
        LP.SellNfts(basicNft.address, local_nfts_id)
      ).to.be.rejectedWith("NotOwner");
    });
    it("eth received", async () => {
      const deployer_balance_before = await ethers.provider.getBalance(
        deployer.address
      );

      const transaction_response = await LP.SellNfts(
        basicNft.address,
        local_nfts_id
      );
      const transaction_receipt = await transaction_response.wait();
      const { gasUsed, effectiveGasPrice } = transaction_receipt;
      const gas_cost = gasUsed.mul(effectiveGasPrice);

      const deployer_balance_after = await ethers.provider.getBalance(
        deployer.address
      );
      assert.equal(
        deployer_balance_before.toString(),
        deployer_balance_after.add(gas_cost).sub(price).toString()
      );
    });
  });
  describe("withdrawProceeds", function () {
    beforeEach(async () => {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
      let price = await LP.getPrice(basicNft.address, 5, true);
      LP.BuyNfts(basicNft.address, 5, { value: price });
      const income = await LP.getBalance(deployer.address);
      assert.notEqual(income.toString(), 0);
    });

    it("revert if income is 0", async function () {
      LP = LPContract.connect(user);
      await expect(LP.withdrawProceeds()).to.be.rejectedWith("NoIncome");
    });
    it("0 balance after withdraw", async () => {
      await LP.withdrawProceeds();
      income = await LP.getBalance(deployer.address);
      assert.equal(income, 0);
    });
    it("income received", async () => {
      const deployer_balance_before = await ethers.provider.getBalance(
        deployer.address
      );
      let income = await LP.getBalance(deployer.address);

      const transaction_response = await LP.withdrawProceeds();
      const transaction_receipt = await transaction_response.wait();
      const { gasUsed, effectiveGasPrice } = transaction_receipt;
      const gas_cost = gasUsed.mul(effectiveGasPrice);

      const deployer_balance_after = await ethers.provider.getBalance(
        deployer.address
      );
      assert.equal(
        deployer_balance_before.toString(),
        deployer_balance_after.add(gas_cost).sub(income).toString()
      );
    });
  });
  describe("getPrice", () => {
    beforeEach(async () => {
      await LP.CreatePool(basicNft.address, nfts_id, { value: PRICE });
    });
    it("revert if wanted to buy more nfts then in pool", async () => {
      await expect(
        LP.getPrice(basicNft.address, NFTS_AMOUNT + 1, true)
      ).to.be.rejectedWith("NotEnoughNftsInPool");
    });
  });
});
