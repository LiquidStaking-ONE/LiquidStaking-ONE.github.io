require("@nomiclabs/hardhat-waffle");

const HARMONY_PRIVATE_KEY = "PASTE_YOUR_PRIVATE_KEY_HERE";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    testnet: {
      url: "https://api.s0.b.hmny.io",
      chainId: 1666700000,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    }
  }
};
