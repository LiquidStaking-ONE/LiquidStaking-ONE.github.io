import './App.scss';
import { CustomInput } from './CustomInput.tsx'
import { View, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react'


export function TabCard(props) {
  const [availableBalanceRounded, setAvailableBalanceRounded] = useState('0.0000')
  const [availableBalanceLockedRounded, setAvailableBalanceLockedRounded] = useState('0.0000')
  const [maxBalance, setMaxBalance] = useState('0.0')

  useEffect(() => {
    console.log("left", props.availableBalance)
    let left = props.availableBalance.split('.')[0];
    let right = props.availableBalance.split('.')[1];
    let exp = Math.pow(10, right.length);
    let roundedRight = '' + Math.round( parseInt(right) * 10000 / exp, 10000);
    if (roundedRight.length < 4) {
      let diff = 4 - roundedRight.length
      for(let i = 0; i < diff; i ++) {
        roundedRight += '0'
      }
    }
    let answer = left + '.' + roundedRight
    // let answer = props.availableBalance
    setAvailableBalanceRounded(answer);
  }, [props.availableBalance]);

  useEffect(() => {
    if (!props.availableLockedBalance) {
      return
    }
    let left = props.availableLockedBalance.split('.')[0];
    let right = props.availableLockedBalance.split('.')[1];
    let exp = Math.pow(10, right.length);
    let roundedRight = '' + Math.round( parseInt(right) * 10000 / exp, 10000);
    if (roundedRight.length < 4) {
      let diff = 4 - roundedRight.length
      for(let i = 0; i < diff; i ++) {
        roundedRight += '0'
      }
    }
    let answer = left + '.' + roundedRight
    // let answer = props.availableLockedBalance
    setAvailableBalanceLockedRounded(answer);
  }, [props.availableLockedBalance]);

  useEffect(() => {
    setMaxBalance(props.availableLockedBalance
    ? ethers.utils.formatUnits(
        ethers.utils.parseUnits(props.availableBalance).
        add(ethers.utils.parseUnits(props.availableLockedBalance)))
    : props.availableBalance);
  }, [props.availableBalance, props.availableLockedBalance]);


  return (
    <>
      <View style={{
            flex: 1,
            marginBottom: 30,
            marginTop: 30,
          }
        }>
        <div>
          <div className="input-swap-container">
          <View style={{ flex: 1, marginBottom: 30 }}>
            <div className="selected-coin"><img src={props.imgSrc} alt="" /></div>
            <button
              className="max-button"
              onClick={() => {props.setValue(maxBalance)}}
              style={{textTransform: "uppercase"}}>Max</button>
              <div>
                <CustomInput
                  decimals={18}
                  setValue={props.setValue}
                  value={props.value}
                  placeholder="0.0"
                  autofocus={props.autofocusInput}
                />
              </div>
          </View>
          </div>
          <div className={`card card-receive`} style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            <table>
                <tr>
                  <td className= "tl">Balance</td>
                  <td className= "tr">
                    {availableBalanceRounded} {props.inSymbol}
                  </td>
                </tr>
                <tr style={{visibility: props.availableLockedBalance ? "inherit" : "collapse"}}>
                  <td className= "tl">Locked</td>
                  <td className= "tr">
                    {availableBalanceLockedRounded} {props.inSymbol}
                  </td>
                </tr>
                <tr>
                  <td className= "tl">Exchange rate</td>
                  <td className= "tr">1 {props.inSymbol} = {props.exchangeRate} {props.outSymbol}</td>
                </tr>
                <tr>
                  <td className= "tl">You will receive</td>
                  <td className= "tr">{ props.exchangeRate * props.value }<span> {props.outSymbol}</span></td>
                </tr>

              </table>
          </div>

      </div>
        <View style={{ flex: 1, marginTop: 30  }}>
            <button
              onClick={e=>props.onSubmit(props.submitAction, props.value)}
              className='stake-button'
              disabled={props.value === '' || ethers.utils.parseUnits(props.value).gte(ethers.utils.parseUnits(maxBalance))}
              >
                {props.walletConnected ? props.submitAction : "Connect Wallet"}
            </button>
        </View>

      </View>
    </>
  );
}
