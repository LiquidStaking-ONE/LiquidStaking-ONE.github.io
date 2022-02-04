import { useState, useEffect } from 'react'
const { toBech32 } = require('@harmony-js/crypto');


export function Header(props) {
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
    <>
      <div className="header">
        <img src={props.imgSrc} className="logo" alt="" />
        {props.account
          ? <button
              className="btn-connect-wallet"
              onClick={() => props.onClickWhenConnected()}>
                {text}
            </button>
          : <button
              onClick={() => props.onClickWhenDisconnected(true)}>
                Connect Wallet
            </button>
        }
      </div>
    </>
  )
}

export default Header;
