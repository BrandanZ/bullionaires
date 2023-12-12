const { expect } = require("chai")
const hre = require("hardhat")

describe("BullToken contract", function () {
  // global vars
  let Token
  let bullToken
  let owner
  let addr1
  let addr2
  let tokenCap = 10000000000000

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("BullToken")
    ;[owner, addr1, addr2] = await hre.ethers.getSigners()

    bullToken = await Token.deploy(tokenCap)
  })

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bullToken.owner()).to.equal(owner.address)
    })

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await bullToken.balanceOf(owner.address)
      expect(await bullToken.totalSupply()).to.equal(ownerBalance)
    })

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await bullToken.cap()
      const expectedCap =
        BigInt(tokenCap) * BigInt(10) ** BigInt(await bullToken.decimals())
      expect(cap).to.equal(expectedCap)
    })
  })

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await bullToken.transfer(addr1.address, 50)
      const addr1Balance = await bullToken.balanceOf(addr1.address)
      expect(addr1Balance).to.equal(50)

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await bullToken.connect(addr1).transfer(addr2.address, 50)
      const addr2Balance = await bullToken.balanceOf(addr2.address)
      expect(addr2Balance).to.equal(50)
    })

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await bullToken.balanceOf(owner.address)
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        bullToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(bullToken, "ERC20InsufficientBalance")

      // Owner balance shouldn't have changed.
      expect(await bullToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      )
    })

    it("Isolate parseUnits issue", async function () {
      try {
        const parsedAmount = ethers.utils.parseUnits("100", 18)
        console.log("Isolated Parsed Amount:", parsedAmount.toString())
      } catch (error) {
        console.error("Isolated Error with parseUnits:", error.message)
      }
    })

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await bullToken.balanceOf(owner.address)

      // Transfer 100 tokens from owner to addr1.
      await bullToken.transfer(addr1.address, 100)

      // Transfer another 50 tokens from owner to addr2.
      await bullToken.transfer(addr2.address, 50)

      // Check balances.
      const finalOwnerBalance = await bullToken.balanceOf(owner.address)
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150))

      const addr1Balance = await bullToken.balanceOf(addr1.address)
      expect(addr1Balance).to.equal(100)

      const addr2Balance = await bullToken.balanceOf(addr2.address)
      expect(addr2Balance).to.equal(50)
    })
  })
})
