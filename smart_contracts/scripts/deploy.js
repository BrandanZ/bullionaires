const hre = require("hardhat")

async function main() {
  try {
    const BullToken = await hre.ethers.getContractFactory("BullToken")

    const bullToken = await BullToken.deploy(10000000000000)

    await bullToken.waitForDeployment()

    console.log("Deployed Contract Instance: ", bullToken.target)
  } catch (error) {
    console.error("An error...", error)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
