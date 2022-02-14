import './App.scss';
import { View } from 'react-native';
import { ClaimCard } from './ClaimCard.js';

export function ClaimTabCard(props) {
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
            {props.walletConnected
              ? (!props.claimTickets
                ? <div style={{margin: "auto"}}>No claim tickets</div>
                : <div style={{
                  width: "100%",
                  }}>{props.claimTickets.map((el, idx) => (
                    <div key={idx}>
                      <ClaimCard
                        imgSrc={props.imgSrc}
                        amount={el.amount}
                        epoch={el.epoch}
                        onClaim={props.onClaim}
                        onRedelegate={props.onRedelegate}
                        tokenId={el.tokenId}
                        enableClaim={el.enableClaim}
                        enableRedelegate={el.enableRedelegate}
                      />
                    </div>
                ))}</div>)
              : <div style={{margin: "auto"}}>Connect wallet to continue</div>}
          </div>
        </div>
      </View>
    </>
  );
}
