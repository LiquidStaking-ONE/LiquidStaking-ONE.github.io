import './App.scss';
import Header from './Components/Header'
import { TabCard } from './TabCard.js'
import Container from 'react-bootstrap/Container'
import { useState, useEffect } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { ethers } from 'ethers'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Modal from 'react-modal';
import MetaMaskOnboarding from '@metamask/onboarding'
// global variables
const abi = require('./LiquidStaking.json')
const contractAddress = "0x49689E62A8133bA25284F9759b1D6c1e305EA19F"

function App() {
  const [ account      ,        setAccount          ]   =     useState(null);
  const [ provider     ,        setProvider         ]   =     useState(null);
  const [ oneBalance   ,        setOneBalance       ]   =     useState('0.0');
  const [ loneBalance  ,        setLoneBalance      ]   =     useState('0.0');
  const [ stoneBalance ,        setStoneBalance     ]   =     useState('0.0');
  const [ stakeAmount  ,        setStakeAmount      ]   =     useState('');
  const [ stoneContract,        setStoneContract    ]   =     useState(null);
  const [ loneContract ,        setLoneContract     ]   =     useState(null);
  const [ exchangeRate ,        setExchangeRate     ]   =     useState("??");
  const [ inverseRate  ,        setInverseRate      ]   =     useState("??");
  const [ activeTab    ,        setActiveTab        ]   =     useState("stake");
  const [ isShowModalWallet,    setIsShowModalWallet]   =     useState(false);
  const [ isShowTrans   ,       setIsShowTrans      ]   =     useState(false);
  const [ transactionHash,      setTransactionHash  ]   =     useState('');
  const [ amountReceived,       setAmountReceived   ]   =     useState('');
  const [ amountReceivedCurrency, setAmountReceivedCurrency] =useState('');
  const [ isShowTransSpinner,   setIsShowTransSpinner]  =     useState(true);

  // if provider changes, set the account and the contract
  useEffect( () => {
    async function handleProviderChange() {
      if (provider) {
        let accounts;
        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          alert(`Could not fetch accounts because ${error.message}`);
          setIsShowModalWallet(false);
          return;
        }
        setAccount(accounts[0]);
        setStoneContract(new ethers.Contract(contractAddress, abi, provider.getSigner()));
      } else {
        setAccount(null);
        setStoneContract(null);
      }
    }
    handleProviderChange();
  }, [provider]);

  useEffect(() => {
  	if ((account) && (provider)) {
      provider.getBalance(account).then(balanceResult => {        // received a big number
        setOneBalance(ethers.utils.formatUnits(balanceResult, "ether")); // string
      })
    } else {
      setOneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"))
    }
  }, [account, provider]);




  useEffect( () => {
    async function handleStoneContractChange() {
      if ((stoneContract) && (provider)) {
        let address;
        try {
          address = await stoneContract.lONE();
        } catch {
          alert('Contract address mismatch, are you on the right network?');
          setLoneContract(null);
          setLoneBalance('0.0');
          setExchangeRate('??');
          setInverseRate('??');
          setIsShowModalWallet(false);
          return;
        }
        console.log('Here');

        setLoneContract(new ethers.Contract(address, abi, provider.getSigner()));
        let totalStaked = await stoneContract.totalStaked();
        let totalSupply = await stoneContract.totalSupply();
        setStoneBalance(ethers.utils.formatUnits(await stoneContract.balanceOf(account), 'ether'));
        if ( totalSupply.eq( ethers.constants.Zero ) ) {
          console.log("boo");
          setExchangeRate("1.0000");
          setInverseRate("1.0000");
        }
        else {
          let exch = (await stoneContract.totalStaked()).div(await stoneContract.totalSupply());
          setExchangeRate(ethers.utils.formatUnits(exch, "wei"));
          setInverseRate(ethers.utils.formatUnits(1.0/exch, "wei"));
        }
      } else {
        setLoneContract(null);
        setExchangeRate("??")
        setInverseRate("??");
        setLoneBalance('0.0000')
      }
    }
    handleStoneContractChange();
  }, [stoneContract, provider, account]);

  useEffect( () => {
    async function handleLoneContractChange() {
      if ((loneContract) && (account)) {
        let balance = await loneContract.balanceOf(account);
        setLoneBalance(ethers.utils.formatUnits(balance, "ether"));
      } else {
        setLoneBalance(ethers.utils.formatUnits(ethers.constants.Zero, "ether"));
      }
    }
    handleLoneContractChange();
  }, [loneContract, account]);

  useEffect( () => {
    console.log("poop");
    setIsShowModalWallet(false);
  }, [exchangeRate]);

  async function connectMetamask() {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      let instance = new MetaMaskOnboarding();
      instance.startOnboarding();
      return
    }
    setIsShowModalWallet(true);
    let chainId = await window.ethereum.request({ method: 'eth_chainId' }); // string
    chainId = ethers.BigNumber.from(chainId);
    let targetChainId = ethers.BigNumber.from("1666700000");
    if (chainId.eq(targetChainId)) {
      setMetamaskProvider();
    } else {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId.toHexString() }],
        });
        setMetamaskProvider();
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            // This doesn't seem to fail if user accepts the add but denies the switch
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetChainId.toHexString(),
                  chainName: 'Harmony Testnet Shard 0',
                  rpcUrls: ['https://api.s0.b.hmny.io']
                },
              ],
            });
            // Handle the missing failure here
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            chainId = ethers.BigNumber.from(chainId);
            if (!chainId.eq(targetChainId)) {
              alert('Could not switch network because User rejected the request.');
              setIsShowModalWallet(false);
              return;
            }
            setMetamaskProvider();
          } catch (addError) {
            alert(`Could not add network because ${addError.message}`);
            setIsShowModalWallet(false);
            console.log(addError);
          }
        } else {
          alert(`Could not switch network because ${switchError.message}`);
          setIsShowModalWallet(false);
          console.log(switchError);
        }
      }
    }
  }

  async function setMetamaskProvider() {
    const localProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(localProvider);
  }

  async function disconnectWallet() {
    setIsShowModalWallet(true);
    setOneBalance('0.0000');
    setLoneBalance('0.0000');
    setStoneBalance('0.0000');
    setProvider(null);
    setAccount(null);
    setTimeout(() => {
      setIsShowModalWallet(false);
    }, 500)

  }

  async function stake(amount) {
    if (!account) {
      alert('No wallet is connected')
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      const nonce = await signer.getTransactionCount()

      let tx = {
        value: ethers.utils.parseUnits(amount, 'ether'),
      };
      const transaction = await contract.stake(tx.value, tx)
      await transaction.wait()

      setTransactionHash('');
      setIsShowTransSpinner(true);
      setIsShowTrans(true);
      setTimeout(() => {
        setIsShowTransSpinner(false);
        setTransactionHash(transaction.hash);
        setAmountReceived( transaction.value );
        setAmountReceivedCurrency('stONE')
        // setIsShowTrans(false)
      }, 2000)

      setLoneBalance(ethers.utils.formatUnits(await loneContract.balanceOf(account), 'ether'));
      setOneBalance(ethers.utils.formatUnits(await provider.getBalance(account), 'ether'));
      setStoneBalance(ethers.utils.formatUnits(await stoneContract.balanceOf(account), 'ether'));

    }
  }

  async function unstake(amount) {
    if (!account) {
      alert('No wallet is connected')
    } else {
      const initialLoneBalance = loneBalance;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      const nonce = await signer.getTransactionCount()
      console.log(amount.toString())
      let tx = {
        value: ethers.utils.parseUnits(amount, 'ether'),
        nonce: nonce
      };
      const transaction = await contract.unstake(tx.value)
      await transaction.wait()
      const finalLoneBalance = loneBalance
      setTransactionHash('');
      setIsShowTransSpinner(true);
      setIsShowTrans(true);
      setTimeout(() => {
        setIsShowTransSpinner(false);
        setTransactionHash(transaction.hash);
        setAmountReceivedCurrency('ONE')
        setAmountReceived(transaction.value);
      }, 2000)

      setLoneBalance(ethers.utils.formatUnits(await loneContract.balanceOf(account), 'ether'));
      setOneBalance(ethers.utils.formatUnits(await provider.getBalance(account), 'ether'));
      setStoneBalance(ethers.utils.formatUnits(await stoneContract.balanceOf(account), 'ether'));
    }
  }

  async function submit(action, value) {
      console.log(`Action: ${action} > Value: ${value}`)
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
        availableLockedBalance={loneBalance}
        maxBalance={ethers.utils.formatUnits(
            ethers.utils.parseUnits(oneBalance).
            add(ethers.utils.parseUnits(loneBalance)))}
        exchangeRate={exchangeRate}
        value={stakeAmount}
        setValue={setStakeAmount}
        submitAction="Stake"
        onSubmit={submit}
        autofocusInput={activeTab === "stake"}
        walletConnected={provider !== null}
        inSymbol="ONE"
        outSymbol="stONE"
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
        autofocusInput={activeTab !== "stake"}
        walletConnected={provider !== null}
        inSymbol="stONE"
        outSymbol="ONE"
      />

  )

  const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute,
  });

  const layout = { width: Dimensions.get('window').width };

  const [index, setIndex] = useState(0);
  const [routes] = useState([
      { key: 'first', title: 'Stake' },
      { key: 'second', title: 'Unstake' },
  ]);
  const styles = StyleSheet.create({
      tabbar: {
        backgroundImage: 'linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2)',
        borderRadius: '0.5em',
        paddingLeft: "1em",
        paddingRight: "1em",
        border: "none",
        fontFamily: "Nunito, sans-serif",
        fontWeight: "1200 !important",
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
          fontWeight: "1200 !important",
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
        onClickWhenDisconnected={connectMetamask}
        onClickWhenConnected={disconnectWallet}
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
        isOpen={isShowModalWallet}
        ariaHideApp={false}
        onRequestClose={() => setIsShowModalWallet(false)}
        style={{content: {height: "15em", backgroundImage: 'linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2)'}}}
      >
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}><div class="lds-ripple"><div></div><div></div></div></div>
      </Modal>

      <Modal
        isOpen={isShowTrans}
        ariaHideApp={false}
        onRequestClose={() => setIsShowTrans(false)}
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
              wordWrap: "anywhere"
            }}>Your transaction has been confirmed with hash <a href={"https://explorer.harmony.one/tx/" + transactionHash}>{transactionHash}</a>
            {amountReceived ? <div>You have received {amountReceived} {amountReceivedCurrency ? amountReceivedCurrency : ""}</div> : ""}
            </div> :
            <div>Your transaction is currently processing</div>
          }
          <div class="lds-ripple" style={{visibility: isShowTransSpinner ? "inherit": "collapse"}}><div></div><div></div></div>
        </div>
      </Modal>
    </>
  );
}

export default App;
