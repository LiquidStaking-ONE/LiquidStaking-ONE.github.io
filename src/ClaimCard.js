import './App.scss';
import { View } from 'react-native';
import { roundString } from './Utils.js';

export function ClaimCard(props) {

  return (
    <div class="claim-card">
      <div>{roundString(props.amount, 4)} ONE</div>
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        position: "relative",
        top: "-1em",
      }}>
        <button
          className="max-button claim-button"
          onClick={() => {props.onClaim(props.tokenId)}}
          disabled={!props.enableClaim}
        >Claim</button>
        <button
          className="max-button redelegate-button"
          onClick={() => {props.onRedelegate(props.tokenId)}}
          disabled={!props.enableRedelegate}
        >Redelegate</button>
      </div>
    </div>
  );
}