import React, { useState, useEffect } from 'react'
import Modal from 'react-modal';
import { Wrapper, Content, LogoImg, ConnectButton, DisconnectButton, ModalHeader, ModalContent, ModalContentButton } from './Header.styles';
import ONELogo from '../../Images/one.png';
const { toBech32 } = require('@harmony-js/crypto');


const Header = (props) => {
  const [text, setText] = useState(null);
  const [walletOptionsVisible, showWalletOptions] = useState(false);

  useEffect(() => {
    if (props.account) {
      const bech32 = toBech32(props.account);
      setText(bech32.slice(0, 8) + "..." +
        bech32.slice(
        bech32.length - 4,
        bech32.length));
    }
  }, [props.account]);

  async function connectMetamask() {
    showWalletOptions(false);
    props.connectMetamask();
  }

  async function connectMathWallet() {
    showWalletOptions(false);
    props.connectMathWallet();
  }

  return (
    <Wrapper>
      <Content>
        <LogoImg src={ONELogo} alt='one-logo' />
        {
          props.account
            ? <DisconnectButton
                onClick={() => props.disconnectWallet()}>
                  {text}
              </DisconnectButton>
            : <ConnectButton
                onClick={() => showWalletOptions(true)}>
                  Connect Wallet
              </ConnectButton>
        }
      </Content>

      <Modal
        isOpen={walletOptionsVisible}
        ariaHideApp={false}
        onRequestClose={() => showWalletOptions(false)}
      >
        <ModalHeader>
          <h3>Select wallet to connect</h3>
          <label onClick={() => showWalletOptions(false)}>x</label>
        </ModalHeader>
        <ModalContent>
          <ModalContentButton onClick={connectMetamask}>Metamask<img src="/images/metamask-logo.png" alt="" /></ModalContentButton>
          <ModalContentButton onClick={connectMathWallet}>MathWallet<img src="/images/mathwallet-logo.png" alt="" /></ModalContentButton>
        </ModalContent>
      </Modal>
    </Wrapper>
  )
}

export default Header;
