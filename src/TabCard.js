import './App.scss';
import { CustomInput } from './CustomInput.tsx'
import { View, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import { roundString } from './Utils.js';
var bigDecimal = require('js-big-decimal');

export function TabCard(props) {
  const [receiveValue, setReceiveValue] = useState('??');

  useEffect(() => {
    if (props.exchangeRate.indexOf('?') === -1) {
      let result;
      if (props.value === '') {
        setReceiveValue('0.0000');
      } else {
        let parsedValue = new bigDecimal(props.value + (
          props.value.indexOf('.') === -1 ? "" : "0" ));
        let exchangeRate = new bigDecimal(props.exchangeRate);
        result = parsedValue.multiply(exchangeRate);
        setReceiveValue(result.round(4).value);
      }
    } else {
      setReceiveValue('??');
    }
  }, [props.value, props.exchangeRate]);

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
              onClick={() => {props.setValue(props.availableBalance)}}
            >Max</button>
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
                    {roundString(props.availableBalance, 4)} {props.inSymbol}
                  </td>
                </tr>
                <tr>
                  <td className= "tl">Exchange rate</td>
                  <td className= "tr">1 {props.inSymbol} = {roundString(props.exchangeRate, 4)} {props.outSymbol}</td>
                </tr>
                <tr>
                  <td className= "tl">You will receive</td>
                  <td className= "tr">{ receiveValue }<span> {props.outSymbol}</span></td>
                </tr>

              </table>
          </div>

      </div>
        <View style={{ flex: 1, marginTop: 30  }}>
            <button
              onClick={e=>props.onSubmit(props.submitAction, props.value)}
              className='stake-button'
              disabled={!props.walletConnected || (props.value === '' ||
                (props.minValue
                  ? (ethers.utils.parseUnits(props.value).gte(ethers.utils.parseUnits(props.availableBalance))
                  || ethers.utils.parseUnits(props.value).lt(ethers.utils.parseUnits(props.minValue)))
                  : ethers.utils.parseUnits(props.value).gt(ethers.utils.parseUnits(props.availableBalance))))}
              >
                {props.walletConnected ? props.submitAction : "Connect wallet to continue"}
            </button>
        </View>

      </View>
    </>
  );
}
