import './App.scss';
import Header from './Components/Header'
import { TabCard } from './TabCard.js'
import { ClaimTabCard } from './ClaimTabCard.js'
import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { ethers } from 'ethers'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Modal from 'react-modal';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Harmony } from '@harmony-js/core';
import { Messenger, HttpProvider } from '@harmony-js/network';
import { ChainID, ChainType, numberToString, toWei, Units, numberToHex } from '@harmony-js/utils';
const { fromBech32, getAddress } = require('@harmony-js/crypto');
const { BN } = require( 'bn.js' );
var bigDecimal = require('js-big-decimal');
// global variables
const stoneAbi = require('./LiquidStaking.json')
const loneAbi  = require('./LockedONE.json')
const contractAddress = "0xEf9022C689e519D293767Ca968dF4afCaB80dfbD";
const rpcUrl = 'https://api.s0.b.hmny.io';

function App() {
  const [ account      ,        setAccount          ]   =     useState(null);
  const [ provider     ,        setProvider         ]   =     useState(null);
  const [ oneBalance   ,        setOneBalance       ]   =     useState('0.0');
  const [ stoneBalance ,        setStoneBalance     ]   =     useState('0.0');
  const [ stakeAmount  ,        setStakeAmount      ]   =     useState('');
  const [ stoneContract,        setStoneContract    ]   =     useState(null);
  const [ loneContract ,        setLoneContract     ]   =     useState(null);
  const [ exchangeRate ,        setExchangeRate     ]   =     useState("??");
  const [ inverseRate  ,        setInverseRate      ]   =     useState("??");
  const [ activeTab    ,        setActiveTab        ]   =     useState("stake");
  const [ loadingScreenVisible,    setLoadingScreenVisible]   =     useState(false);
  const [ transactionModalVisible   ,       setTransactionModalVisible      ]   =     useState(false);
  const [ transactionHash,      setTransactionHash  ]   =     useState('');
  const [ amountReceived,       setAmountReceived   ]   =     useState('');
  const [ amountReceivedCurrency, setAmountReceivedCurrency] = useState('');
  const [ transactionSpinnerVisible,   setTransactionSpinnerVisible]  =     useState(true);
  const [ walletType, setWalletType ] = useState(null);
  const [ claimTickets, setClaimTickets ] = useState([]);

  const messenger = new Messenger(
    new HttpProvider(rpcUrl),
    ChainType.Harmony,
    ChainID.HmyTestnet,
  )

  const getCurrentEpoch = async () => {
    const result = await messenger.send(
      "hmyv2_getEpoch",
      [],
      messenger.chainPrefix,
      messenger.currentShard,
    );
    return result.raw.result;
  };

  const getRewards = async (address) => {
    let result = await messenger.send(
      "hmyv2_getDelegationsByDelegator",
      [address],
      messenger.chainPrefix,
      messenger.currentShard,
    );
    result = result.raw.result;
    let sumRewards = ethers.constants.Zero;
    result.forEach((item, i) => {
      sumRewards = sumRewards.add(
        item.reward + ''
      );
    });
    return sumRewards;
  };


  // if provider changes, set the account and the contract
  useEffect( () => {
    async function handleProviderChange() {
      if (walletType === "Metamask") {
        if (provider) {
          let accounts;
          try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
            alert(`Could not fetch accounts because ${error.message}`);
            setLoadingScreenVisible(false);
            return;
          }
          setAccount(accounts[0]);
          setStoneContract(new ethers.Contract(contractAddress, stoneAbi, provider.getSigner()));
        } else {
          setAccount(null);
          setStoneContract(null);
        }
      } else if (walletType === "MathWallet") {
        if (provider) {
          let localAccount;
          try {
            localAccount = await window.harmony.getAccount();
          } catch (error) {
            alert(`Could not fetch accounts because ${error.message}`);
            setLoadingScreenVisible(false);
            return;
          }
          setAccount(fromBech32(localAccount.address));
          setStoneContract(provider.contracts.createContract(stoneAbi, contractAddress));
        } else {
          setAccount(null);
          setStoneContract(null);
        }
      } else {
        setAccount(null);
        setStoneContract(null);
      }
    }
    handleProviderChange();
  }, [provider, walletType]);

  async function updateOneBalance() {
    if (walletType === 'Metamask') {
    	if ((account) && (provider)) {
        provider.getBalance(account).then(balanceResult => {        // received a big number
          setOneBalance(ethers.utils.formatUnits(balanceResult, "ether")); // string
        })
      } else {
        setOneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"))
      }
    } else if (walletType === 'MathWallet') {
      if ((account) && (provider)) {
        provider.blockchain.getBalance({address: account}).then(balanceResult => {
          setOneBalance(ethers.utils.formatUnits(balanceResult.result, "ether"));
        });
      } else {
        setOneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
      }
    } else {
      setOneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
    }
  }

  // changes only one balance
  // depends on provider and account only
  useEffect(() => {
    updateOneBalance();
  }, [account, provider, walletType]);

  async function handleStoneContractChange() {
    if (walletType === 'Metamask') {
      if ((stoneContract) && (provider) && (account)) {
        let address;
        try {
          address = await stoneContract.lONE();
        } catch {
          alert('Contract address mismatch, are you on the right network?');
          setLoneContract(null);
          setExchangeRate('??');
          setInverseRate('??');
          setStoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
          setLoadingScreenVisible(false);
          return;
        }

        setLoneContract(new ethers.Contract(address, loneAbi, provider.getSigner()));
        let totalStaked = await stoneContract.totalStaked();
        let totalSupply = await stoneContract.totalSupply();
        setStoneBalance(ethers.utils.formatUnits(await stoneContract.balanceOf(account), 'ether'));
        if ( totalSupply.eq( ethers.constants.Zero ) ) {
          setExchangeRate("1.00");
        }
        else {
          let rewards = await getRewards( contractAddress );  // wei, so add directly
          totalStaked = new bigDecimal( totalStaked );
          totalSupply = new bigDecimal( totalSupply );
          rewards = new bigDecimal( rewards );
          setExchangeRate( ( totalStaked.add( rewards ) ).divide( totalSupply ).value );
        }
      } else {
        setLoneContract(null);
        setExchangeRate('??');
        setStoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
      }
    } else if (walletType === 'MathWallet') {
      if ((stoneContract) && (provider) && (account)) {
        let address;
        try {
          address = await stoneContract.methods.lONE().call();

        } catch (error) {
          alert('Contract address mismatch, are you on the right network?');
          setLoneContract(null);
          setExchangeRate('??');
          setStoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
          setLoadingScreenVisible(false);
          return;
        }
        setLoneContract(provider.contracts.createContract(loneAbi, address));
        stoneContract.wallet.setSigner( getAddress(account).checksum );
        stoneContract.wallet.signTransaction = async (tx) => {
          try {
            const signTx = await window.harmony.signTransaction(tx);
            return signTx;
          } catch (e) {
            console.log(e);
            return Promise.reject(e);
          }
        };
        let localStoneBalance = numberToString(await stoneContract.methods.balanceOf(account).call());
        setStoneBalance( ethers.utils.formatUnits( ethers.utils.parseUnits( localStoneBalance, "wei" ) ) );
        let totalStaked = numberToString(await stoneContract.methods.totalStaked().call());
        let totalSupply = numberToString(await stoneContract.methods.totalSupply().call());
        // convert to ethers big number
        totalStaked = ethers.utils.parseUnits( totalStaked );
        totalSupply = ethers.utils.parseUnits( totalSupply );
        if ( totalSupply.eq( ethers.constants.Zero ) ) {
          setExchangeRate("1.00");
        }
        else {
          let rewards = await getRewards( contractAddress );  // wei, so add directly
          totalStaked = new bigDecimal( totalStaked );
          totalSupply = new bigDecimal( totalSupply );
          rewards = new bigDecimal( rewards );
          setExchangeRate( ( totalStaked.add( rewards ) ).divide( totalSupply ).value );
        }
      } else {
        setLoneContract(null);
        setExchangeRate('??');
        setStoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
      }
    } else {
      setLoneContract(null);
      setExchangeRate('??');
      setStoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
    }
  }

  useEffect( () => {
    handleStoneContractChange();
  }, [stoneContract, provider, account, walletType]);

  async function handleLoneContractChange() {
    if (walletType === "Metamask") {
      if ((loneContract) && (account)) {
        // ethers bignumber
        let length = await loneContract.balanceOf(account);
        // does not work on localhost in firefox
        let currentEpoch = ethers.BigNumber.from(await getCurrentEpoch());
        for(let i = ethers.constants.Zero; i.lt(length); i = i.add(ethers.constants.One)) {
          let userTokenId = await loneContract.tokenOfOwnerByIndex(account, i);
          let amount = await loneContract.getAmountOfTokenByIndex(userTokenId);
          amount = ethers.utils.formatUnits( amount );
          let epoch = await loneContract.getEpochOfTokenByIndex(userTokenId);
          // currentEpoch > epoch + 6
          let enableClaim = currentEpoch.gt(epoch.add(ethers.utils.parseUnits('6', 'wei')));
          let enableRedelegate = currentEpoch.gt(epoch);
          epoch = ethers.utils.formatUnits( epoch, "wei" );
          setClaimTickets(claimTickets => [...claimTickets, {
            amount: amount,
            epoch: epoch,
            tokenId: ethers.utils.formatUnits(userTokenId, 'wei'),
            enableClaim: enableClaim,
            enableRedelegate: enableRedelegate,
          }]);
        }
      } else {
        setClaimTickets([]);
      }
    } else if (walletType === "MathWallet") {
      if ((loneContract) && (account)) {
        let length = numberToString(await loneContract.methods.balanceOf(account).call());
        length = ethers.utils.parseUnits(length, "wei");
        let currentEpoch = ethers.BigNumber.from(await getCurrentEpoch());
        for(let i = ethers.constants.Zero; i.lt(length); i = i.add(ethers.constants.One)) {
          let hmyCompatI = new BN(i.toString());
          let userTokenId = await loneContract.methods.tokenOfOwnerByIndex(account, hmyCompatI).call();
          let amount = ethers.utils.formatUnits(
            ethers.utils.parseUnits(
              numberToString( await loneContract.methods.getAmountOfTokenByIndex( userTokenId ).call() ),
              "wei" )
          );
          let epoch = ethers.utils.formatUnits(
            ethers.utils.parseUnits(
              numberToString( await loneContract.methods.getEpochOfTokenByIndex( userTokenId ).call() ),
              "ether" )
            );
          // currentEpoch > epoch + 6
          let parsedEpoch = ethers.utils.parseUnits(epoch, 'wei');
          let enableClaim = currentEpoch.gt(parsedEpoch.add(ethers.utils.parseUnits('6', 'wei')));
          let enableRedelegate = currentEpoch.gt(parsedEpoch);
          setClaimTickets(claimTickets => [...claimTickets, {
            amount: amount,
            epoch: epoch,
            tokenId: numberToString(userTokenId),
            enableClaim: enableClaim,
            enableRedelegate: enableRedelegate,
          }]);
        }
      } else {
        setClaimTickets([]);
      }
    } else {
      setClaimTickets([]);
    }
  }

  useEffect( () => {
    handleLoneContractChange();
  }, [loneContract, account, walletType]);

  useEffect( () => {
    setLoadingScreenVisible(false);
    if (exchangeRate.indexOf('?') === -1) {
      setInverseRate(
        new bigDecimal('1.0').divide(
          new bigDecimal(exchangeRate)
        ).value
      );
    } else {
      setInverseRate('??');
    }
  }, [exchangeRate]);

  async function connectMetamask() {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      let instance = new MetaMaskOnboarding();
      instance.startOnboarding();
      return;
    }
    setLoadingScreenVisible(true);
    let chainId = await window.ethereum.request({ method: 'eth_chainId' }); // string
    chainId = ethers.BigNumber.from(chainId);
    let targetChainId = ethers.BigNumber.from("1666700000");
    if (chainId.eq(targetChainId)) {
      setMetamaskProviderFromWindow();
    } else {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId.toHexString() }],
        });
        setMetamaskProviderFromWindow();
      } catch (switchError) {
        // This error code indicates that the chain has not been added to Metamask.
        if (switchError.code === 4902) {
          try {
            // This doesn't seem to fail if user accepts the add but denies the switch
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetChainId.toHexString(),
                  chainName: 'Harmony Testnet Shard 0',
                  rpcUrls: [ rpcUrl ],
                  blockExplorerUrls: [ 'https://explorer.testnet.harmony.one' ],
                  nativeCurrency: {
                    name: 'Harmony',
                    symbol: 'ONE',
                    decimals: 18,
                  }
                },
              ],
            });
            // Handle the missing failure here
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            chainId = ethers.BigNumber.from(chainId);
            if (!chainId.eq(targetChainId)) {
              alert('Could not switch network because User rejected the request.');
              setLoadingScreenVisible(false);
              return;
            }
            setMetamaskProviderFromWindow();
          } catch (addError) {
            alert(`Could not add network because ${addError.message}`);
            setLoadingScreenVisible(false);
            console.log(addError);
          }
        } else {
          alert(`Could not switch network because ${switchError.message}`);
          setLoadingScreenVisible(false);
          console.log(switchError);
        }
      }
    }
  }

  async function setMetamaskProviderFromWindow() {
    const localProvider = new ethers.providers.Web3Provider(window.ethereum);
    setWalletType('Metamask');
    setProvider(localProvider);
  }

  async function disconnectWallet() {
    setLoadingScreenVisible(true);
    setProvider(null);
    setWalletType('');
  }

  async function connectMathWallet() {
    if (("harmony" in window) && window.harmony.isMathWallet) {
      setLoadingScreenVisible(true);
      let chainId = window.harmony.network.chain_id;
      chainId = ethers.BigNumber.from(chainId);
      let targetChainId = ethers.BigNumber.from("1666700000");
      if (chainId.eq(targetChainId)) {
        let hmy = new Harmony(window.harmony.network.chain_url, {
          chainType: ChainType.Harmony,
          chainId: ChainID.HmyTestnet
        });
        setWalletType('MathWallet');
        setProvider(hmy);
      } else {
        alert('Unexpected chain id');
        setLoadingScreenVisible(false);
      }
    } else {
      window.open("https://mathwallet.org/", "_blank");
    }
  }

  async function stake(amount) {
    if (walletType === "Metamask") {
      if (!account) {
        alert('No account available');
      } else if (!provider) {
        alert('No provider available');
      } else {
        setTransactionHash('');
        setTransactionSpinnerVisible(true);
        setTransactionModalVisible(true);
        let options = {
          value: ethers.utils.parseUnits(amount, 'ether'),
          gasPrice: ethers.utils.parseUnits('30', 'gwei'),
        }
        // first tx.value is param "amount"
        // second is actually sending it money using msg.value
        let transaction;
        try {
          transaction = await stoneContract.stake(options.value, options);
        } catch (error) {
          setTransactionModalVisible(false);
          setTransactionSpinnerVisible(false);
          alert(error.message + (error.data ? '\n' + error.data.message : ''));
          return;
        }
        let receipt = await transaction.wait();
        let txHash = receipt.transactionHash;
        setTransactionSpinnerVisible(false);
        setTransactionHash(txHash);
        updateOneBalance();
      }
    } else if (walletType === "MathWallet") {
      if (!account) {
        alert('No account available');
      } else if (!provider) {
        alert('No provider available');
      } else {
        setTransactionHash('');
        setTransactionSpinnerVisible(true);
        setTransactionModalVisible(true);
        let transaction;
        try {
          transaction = stoneContract.methods.stake(
            toWei(amount, Units.one)
          ).send(
            {
              gasPrice: numberToHex( toWei(30, Units.Gwei) ),
              from: getAddress(account).checksum, // mandatory!!
              value: numberToHex( toWei(amount, Units.one) ),
            }
          )
        } catch (error) {
          setTransactionModalVisible(false);
          setTransactionSpinnerVisible(false);
          alert(error.message);
          return;
        }
        let txHash = transaction.transaction.receipt.transactionHash;
        setTransactionHash(txHash);
        setTransactionSpinnerVisible(false);
        updateOneBalance();
      }
    } else {
      alert('How did you click here without connecting a wallet?');
    }
  }

  async function unstake(amount) {
    if (walletType === "Metamask") {
      if (!account) {
        alert('No account available');
      } else if (!provider) {
        alert('No provider available');
      } else {
        setTransactionHash('');
        setTransactionSpinnerVisible(true);
        setTransactionModalVisible(true);
        let options = {
          gasPrice: ethers.utils.parseUnits('30', 'gwei'),
        }
        let transaction;
        try {
          transaction = await stoneContract.unstake(
            ethers.utils.parseUnits(amount, 'ether'),
            options
          );
        } catch (error) {
          setTransactionModalVisible(false);
          setTransactionSpinnerVisible(false);
          alert(error.message + (error.data ? '\n' + error.data.message : ''));
          return;
        }
        let receipt = await transaction.wait();
        let txHash = receipt.transactionHash;
        setTransactionHash(txHash);
        setTransactionSpinnerVisible(false);
        handleStoneContractChange();
      }
    } else if (walletType === "MathWallet") {
      if (!account) {
        alert('No account available');
      } else if (!provider) {
        alert('No provider available');
      } else {
        setTransactionHash('');
        setTransactionSpinnerVisible(true);
        setTransactionModalVisible(true);
        let transaction;
        try {
          transaction = await stoneContract.methods.unstake(
            toWei(amount, Units.one)
          ).send(
            {
              gasPrice: numberToHex( toWei(30, Units.Gwei) ),
              from: getAddress(account).checksum, // mandatory!!
            }
          );
        } catch (error) {
          setTransactionModalVisible(false);
          setTransactionSpinnerVisible(false);
          alert(error.message);
          return;
        }
        let txHash = transaction.transaction.receipt.transactionHash;
        setTransactionHash(txHash);
        setTransactionSpinnerVisible(false);
        handleStoneContractChange();
      }
    } else {
      alert('How did you click here without connecting a wallet?');
    }
  }

  async function submit(action, value) {
      if (action === "Stake") {
          stake(value)
      }
      else if (action === "Unstake") {
          unstake(value)
      }
  }
  const FirstRoute = () => (
      <TabCard
        imgSrc="images/one.png"
        availableBalance={oneBalance}
        exchangeRate={exchangeRate}
        value={stakeAmount}
        setValue={setStakeAmount}
        submitAction="Stake"
        onSubmit={submit}
        autofocusInput={activeTab === "stake"}
        walletConnected={provider !== null}
        inSymbol="ONE"
        outSymbol="stONE"
        minValue="100.0"
      />
  )

  const SecondRoute = () => (
      <TabCard
        imgSrc="images/one.png"
        availableBalance={stoneBalance}
        exchangeRate={inverseRate}
        value={stakeAmount}
        setValue={setStakeAmount}
        submitAction="Unstake"
        onSubmit={submit}
        autofocusInput={activeTab === "unstake"}
        walletConnected={provider !== null}
        inSymbol="stONE"
        outSymbol="ONE"
      />
  )
  const ThirdRoute = () => (
      <ClaimTabCard
        imgSrc="images/one.png"
        walletConnected={provider !== null}
        claimTickets={claimTickets}
        onClaim={claimThisTicket}
        onRedelegate={redelegateThisTicket}
      />
  )

  // tokenId is a string, may contain .0 if metamask
  async function claimThisTicket(tokenId) {
    if (walletType === 'Metamask') {
      setTransactionHash('');
      setTransactionSpinnerVisible(true);
      setTransactionModalVisible(true);
      tokenId = ethers.utils.parseUnits(tokenId, "wei");
      let options = {
        gasPrice: ethers.utils.parseUnits('30', 'gwei'),
      }
      let transaction;
      try {
        transaction = await stoneContract.claim(tokenId, options);
      } catch (error) {
        setTransactionModalVisible(false);
        setTransactionSpinnerVisible(false);
        alert(error.message + (error.data ? '\n' + error.data.message : ''));
        return;
      }
      handleLoneContractChange();
    } else if (walletType === 'MathWallet') {
      setTransactionHash('');
      setTransactionSpinnerVisible(true);
      setTransactionModalVisible(true);
      tokenId = new BN( tokenId );
      let transaction;
      try {
        transaction = await stoneContract.methods.claim(
          tokenId
        ).send(
          {
            gasPrice: numberToHex( toWei(30, Units.Gwei) ),
            from: getAddress(account).checksum, // mandatory!!
          }
        )
      } catch (error) {
        setTransactionModalVisible(false);
        setTransactionSpinnerVisible(false);
        alert(error.message);
        return;
      }
      let txHash = transaction.transaction.receipt.transactionHash;
      setTransactionHash(txHash);
      setTransactionSpinnerVisible(false);
      handleLoneContractChange();
    } else {
      alert('Not possible');
    }
  }

  async function redelegateThisTicket(tokenId) {
    if (walletType === 'Metamask') {
      setTransactionHash('');
      setTransactionSpinnerVisible(true);
      setTransactionModalVisible(true);
      tokenId = ethers.utils.parseUnits(tokenId, "wei");
      let options = {
        gasPrice: ethers.utils.parseUnits('30', 'gwei'),
      }
      let transaction;
      try {
        transaction = await stoneContract.reDelegate(tokenId, options);
      } catch (error) {
        setTransactionModalVisible(false);
        setTransactionSpinnerVisible(false);
        alert(error.message + (error.data ? '\n' + error.data.message : ''));
        return;
      }
      handleLoneContractChange();
    } else if (walletType === 'MathWallet') {
      setTransactionHash('');
      setTransactionSpinnerVisible(true);
      setTransactionModalVisible(true);
      tokenId = new BN( tokenId );
      let transaction;
      try {
        transaction = await stoneContract.methods.reDelegate(
          tokenId
        ).send(
          {
            gasPrice: numberToHex( toWei(30, Units.Gwei) ),
            from: getAddress(account).checksum, // mandatory!!
          }
        );
        console.log(transaction);
      } catch (error) {
        setTransactionModalVisible(false);
        setTransactionSpinnerVisible(false);
        alert(error.message);
        return;
      }
      let txHash = transaction.transaction.receipt.transactionHash;
      setTransactionHash(txHash);
      setTransactionSpinnerVisible(false);
      handleLoneContractChange();
    } else {
      alert('Not possible');
    }
  }

  const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute,
      third: ThirdRoute,
  });

  const layout = { width: Dimensions.get('window').width };

  const [index, setIndex] = useState(0);
  const [routes] = useState([
      { key: 'first', title: 'Stake' },
      { key: 'second', title: 'Unstake' },
      { key: 'third', title: 'Claim' },
  ]);
  const styles = StyleSheet.create({
      tabbar: {
        backgroundImage: 'linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2)',
        borderRadius: '0.5em',
        paddingLeft: "1em",
        paddingRight: "1em",
        border: "none",
        fontFamily: "Nunito, sans-serif",
        color: "#031217",
        inactiveColor: "#00000040",
      },
      indicator: {
        backgroundColor: '#ffffff80',
      },

  });
  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.indicator}
        style={styles.tabbar}
        labelStyle= {{
          fontFamily: "Nunito, sans-serif",
          color:  "Black",
          fontSize: "1.2em",
          textTransform: "",
        }}
        inactiveColor={"#00000060"}
      />
    );
  };
  return (
    <>
      <Header
        account={account}
        disconnectWallet={disconnectWallet}
        connectMetamask={connectMetamask}
        connectMathWallet={connectMathWallet}
      />

      <Container className="container-small">
        <h1>Liquid Staking</h1>
      <div className={`card swap-card`}>

        <TabView
          renderTabBar = {renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={layout}

        />

      </div>

      </Container>

      <Modal
        isOpen={loadingScreenVisible}
        ariaHideApp={false}
        onRequestClose={() => setLoadingScreenVisible(false)}
        style={{content: {height: "15em", backgroundImage: 'linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2)'}}}
      >
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}><div class="lds-ripple"><div></div><div></div></div></div>
      </Modal>

      <Modal
        isOpen={transactionModalVisible}
        ariaHideApp={false}
        onRequestClose={() => setTransactionModalVisible(false)}
        style={{content: {height: "10em"}}}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flexDirection: "column",
          paddingLeft: "1em",
          paddingRight: "1em",
        }}
        >
          {transactionHash ?
            <div style={{
              wordWrap: "anywhere",
              position: "absolute",
              top: "1em",
              margin: "1em",
            }}>Your transaction has been confirmed with hash <a href={"https://explorer.testnet.harmony.one/tx/" + transactionHash} style={{color: "#ffffff"}}>{transactionHash}</a>
            {amountReceived ? <div>You have received {amountReceived} {amountReceivedCurrency ? amountReceivedCurrency : ""}</div> : ""}
            </div> :
            <div>Your transaction is currently processing</div>
          }
          <div class="lds-ripple" style={{visibility: transactionSpinnerVisible ? "inherit": "collapse"}}><div></div><div></div></div>
        </div>
      </Modal>
    </>
  );
}

export default App;
