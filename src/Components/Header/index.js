import React, { useState, useEffect } from 'react'
import { Wrapper, Content, LogoImg, ConnectButton } from './Header.styles';
import ONELogo from '../../Images/one.png';
const { toBech32 } = require('@harmony-js/crypto');


const Header = (props) => {
  const [text, setText] = useState(null);

  useEffect(() => {
    if (props.account) {
      const bech32 = toBech32(props.account);
      setText(bech32.slice(0, 8) + "..." +
        bech32.slice(
        bech32.length - 4,
        bech32.length));
    }
  }, [props.account])

  return (
    <Wrapper>
      <Content>
        <LogoImg src={ONELogo} alt='one-logo' />
        {
          props.account
            ? <ConnectButton
                onClick={() => props.onClickWhenConnected()}>
                  {text}
              </ConnectButton>
            : <ConnectButton
                onClick={() => props.onClickWhenDisconnected(true)}>
                  Connect Wallet
              </ConnectButton>
        }
      </Content>
    </Wrapper>

  )
}

export default Header;
