# Harmony Dapp Template Beginner


## Template setup
1. npm install.
2. After npm install, setup Metamask wallet in your browser. The setup guide can follow via link [https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet].
3. Once you done setting up the Metamask wallet with Harmony Testnet, in the file `hardhat.config.js` replace the `HARMONY_PRIVATE_KEY` with your own Harmony private key. At the bottom of the file you will see network testnet with using this private key which mean the later contract transaction will link to this account.
4. Next, open node and run `npx hardhat run --network testnet scripts/deploy.js`, the testnet here is what we setup in the previous step. Once the command executed, you are suppose to see a line in node which mentioned contract deployed to which address, copy the address and go to `App.js`, paste the address to the line `PASTE_YOUR_CONTRACT_ADDRESS_HERE`
5. Everything should be work now, You are now test and play around with the template. 

## How it works
![template-showcase](https://user-images.githubusercontent.com/23028389/126910316-df13e358-3d25-4158-8fb9-8bfe00ddb611.png)

## How to edit the contract
1. You can edit the Transaction.sol inside the `contracts` folder.
2. Everytime you edit the contract, you are required to compile with using command `npx hardhat compile`.

## Other
* This template can help you connect to Metamask, MathWallet and WalletConnect. But for test case, signing of contract is using ONLY Metamask. If you need to execute transaction with other wallet, you may need to edit the signing methods based on different wallets connected.
* A simple template for beginner can play around and get the concept. Hope the UI can help also for whoever need some UI template for Hackhathon etc.
* Happy Coding.   

`#ReactJS` `#Hardhat` `#etherjs`
