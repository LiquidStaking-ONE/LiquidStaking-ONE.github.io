import { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import './App.scss';
import { ethers } from 'ethers'
import { providers } from "ethers";
import Container from 'react-bootstrap/Container';
import Modal from 'react-modal';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Transaction from './artifacts/contracts/Transaction.sol/Transaction.json'
import 'typeface-nunito';

const abi = require('./liquidStakingabi.json')
const stoneAddress = "0xD259Ca3eF674205FABD949e20F2B3B5A9E3C33bD"

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
  },
  scene: {
    flex: 1,
    marginBottom: 30,
    marginTop: 30,
  },
});


function App() {
  const [stakeAmount, setStakeAmount] = useState(null);

  const [account, setAccount] = useState();

  const [youReceive, setYouReceive] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [transactionCost, setTransactionCost] = useState(0.001);

  const [userBalance, setUserBalance] = useState(0.0);
  const [contractAmount, setContractAmount] = useState(0);
  const [isShowModalWallet, setIsShowModalWallet] = useState(false);
  const [currentWallet, setCurrentWallet] = useState();
  const [provider, setProvider] = useState(null);

  const [value, setValue] = useState(0);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Stake' },
    { key: 'second', title: 'Unstake' },
  ]);

  const FirstRoute = () => (
    <View style={[styles.scene]}>
      <div>
        <div className="input-swap-container">
        <View style={{ flex: 1, marginBottom: 30 }}>
          <div className="selected-coin"><img src="/images/one.png" alt="" /></div>
          <button className="max-button" onClick={() => setStakeAmount(userBalance ? ethers.utils.parseUnits(userBalance, 'ether'): 0)}>MAX</button>
          <input
            placeholder="0.0"
            pattern="^[0-9]*[.,]?[0-9]*$"
          />
        </View>
        </div>
        <div className={`card card-receive`}>
          <table>
              <tr>
                <td className= "tl">Balance</td>
                <td className= "tr">{userBalance}</td>
              </tr>
              <tr>
                <td className= "tl">Exchange rate</td>
                <td className= "tr">1 ONE = 1 stONE</td>
              </tr>
              <tr>
                <td className= "tl">You will receive</td>
                <td className= "tr">{userBalance*exchangeRate }<span> stONE</span></td>
              </tr>
            </table>
        </div>
      </div>

    </View>
  );

  const SecondRoute = () => (
    <View style={[styles.scene]}>
      <div>
        <div className="input-swap-container">
          <View style={{ flex: 1, marginBottom: 30 }}>
            <div className="selected-coin"><img src="/images/one.png" alt="" /></div>
            <button className="max-button" onClick={() => setValue(ethers.utils.parseUnits(userBalance, 'ether'))}>MAX</button>
            <input onChange={e => setStakeAmount(e.target.value)} placeholder="0.00" />
          </View>
        </div>
        <div className={`card card-receive`}>
          <table>
              <tr>
                <td className= "tl">Balance</td>
                <td className= "tr">{userBalance}</td>
              </tr>
              <tr>
                <td className= "tl">Exchange rate</td>
                <td className= "tr">1 ONE = 1 stONE</td>
              </tr>
              <tr>
                <td className= "tl">You will receive</td>
                <td className= "tr">{userBalance*exchangeRate }<span> stONE</span></td>
              </tr>
            </table>
        </div>
      </div>

    </View>
  );
  const initialLayout = { width: Dimensions.get('window').width };

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  // const renderTabBar = props => (
  // 	<TabBar
  //    	 {...props}
  //     	activeColor={'black'}
  //     	inactiveColor={'white'}
  // 	/>
  // );

  const renderTabBar = props => (
    <TabBar
      {...props}
        style={{backgroundImage: 'linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2)',
                paddingLeft: "1em",
                paddingRight: "1em",
                borderRadius: "10px",
                fontFamily: "Nunito, sans-serif",
                fontWeight: "1200 !important",
              }}
        activeColor={'#000000'}
        indicatorStyle={{ backgroundColor: '#ffffff80' }}
      	inactiveColor={'#00000040'}
        labelStyle={{fontFamily: "Nunito, sans-serif", textTransform: 'capitalize'}}
      />
    );

  // Connect Wallet
  async function connectWallet() {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    setIsShowModalWallet(false)
    setCurrentWallet('metamask')
  }

  // Connect MatchWallet
  async function connectMathWallet() {
    try {
      const account = await window.harmony.getAccount();
      setAccount(account.address)
      setIsShowModalWallet(false)
      setCurrentWallet('mathwallet')
    } catch {
      alert('Please login MathWallet')
    }
  }

  // Connect WalletConnect
  async function connectWalletConnect() {
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "PASTE_INFURA_ID_HERE"
    });

    try {
      await walletConnectProvider.enable();
      const provider = new providers.Web3Provider(walletConnectProvider);
      const signer = provider.getSigner();
      setAccount(await signer.getAddress())
      setIsShowModalWallet(false)
      setCurrentWallet('walletconnect')
    } catch {
      setIsShowModalWallet(false)
    }
  }

  async function sendCoin() {
    if (!account) {
      alert('No wallet is connected')
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contractObject = new ethers.Contract(stoneAddress, abi, signer)
      const nonce = await signer.getTransactionCount()
      console.log(stakeAmount.toString())
      return
      let tx = {
        value: ethers.utils.parseEther(stakeAmount)
      };

      const transaction = await contractObject.addMoney(tx)
      await transaction.wait()
    }
  }

  async function getContractAmount() {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(stoneAddress, Transaction.abi, signer)
      const contractAmount = await contract.getMoneyStored()

      setContractAmount(ethers.utils.formatEther(contractAmount))
    } else {
      alert('No wallet is connected')
    }
  }

  function fillInputWithMAX(v){
    document.getElementById('inputbox').value = v
    console.log(v);
    return false;
  }
  // useEffect(() => {
  // }, [])

  useEffect(() => {
  	if(account){
  	provider.getBalance(account)
  	.then(balanceResult => {
  		setUserBalance(ethers.utils.formatEther(balanceResult));
  	})
  	};
}, [account]);

  return (
    <>
      <div className="header">
        <img src="images/logo.png" className="logo" alt="" />
        {account
          ? <button className="btn-connect-wallet" onClick={() => setIsShowModalWallet(true)}>{account}</button>
          : <button onClick={() => setIsShowModalWallet(true)}>Connect Wallet</button>
        }
      </div>

      <Container className="container-small">
        <h1>Liquid Staking</h1>
        <div className={`card swap-card`}>

          <div class="tabview">
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
              />
          </div>
          <button onClick={sendCoin}>Submit</button>
        </div>
      </Container>

      <Modal
        isOpen={isShowModalWallet}
        ariaHideApp={false}
        onRequestClose={() => setIsShowModalWallet(false)}
      >
        <div className="modal-header">
          <h3>Select wallet to connect</h3>
          <label onClick={() => setIsShowModalWallet(false)}>x</label>
        </div>
        <div className="modal-content">
          <button onClick={connectWallet}>Metamask<img src="/images/metamask-logo.png" alt="" /></button>
          <button onClick={connectMathWallet}>MathWallet<img src="/images/mathwallet-logo.png" alt="" /></button>
          <button onClick={connectWalletConnect}>WalletConnect<img src="/images/walletconnect-logo.png" alt="" /></button>
        </div>
      </Modal>
    </>
  );
}


export default App;
// <div className="TabBar">
//   <TabView
//     navigationState={{ index, routes }}
//     renderScene={renderScene}
//     onIndexChange={setIndex}
//     initialLayout={initialLayout}
//     style={styles.container}
//   />
// </div>
//
// <button class="stake-button" >Stake</button>
// <button class="unstake-button" >Unstake</button>
