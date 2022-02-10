import * as React from "react";
function Landing() {
    return (
        <>
        <div id="wrapper">
        <div id="main">
            <div className="inner">
                <div id="container06" className="container default full screen">
                    <div className="wrapper">
                        <div className="inner">
                            <h1 id="text24">Liquid Staking</h1>
                            <p id="text18">Earn higher yields from defi while contributing to the security of the Harmony Blockchain</p>
                            <ul id="buttons01" className="buttons">
                                <li><a href="/#/app" className="button n01" >
                                    <span className="label" style={{color:"#a2a2b0"}}>Enter App</span></a></li>
                            </ul>
                        </div>
                        {
                        // <div className="container" style={{
                        //     display: "flex",
                        //     justifyContent: "center",
                        //     height: "1em",
                        // }}>
                        //   <div style={{
                        //       width: "100%",
                        //       height: "1em"
                        //   }}><a href="https://twitter.com/liquid_staking" className="footer-link"><i className="fab fa-twitter footer-icon"></i></a></div>
                        //   <span><a href="https://discord.gg/s4exf93vN3"><i className="fab fa-discord footer-icon"></i></a></span>
                        // </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
    );
}

export default Landing;
