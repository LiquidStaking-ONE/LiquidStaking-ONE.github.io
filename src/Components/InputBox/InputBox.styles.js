import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  /* position: absolute; */
  align-items: center;
  height: 60px;
  margin: 1em;
  `;


export const Content = styled.div`
  position: relative;
  width: 100%;
  height: 60px;

  input {
      width: 100%;
      height: 60px;
      padding-left: 50px;
      padding-right: 80px;
      background: #1c414d;
      color: #fff;
      border: 2px solid #00D2BC;
      border-radius: 10px;
      font-weight: 700;

    :focus {
      outline: none;
      direction: "ltr";
    }
  }

  img {
    position: absolute;
    left: 15px;
    top: 14px;
    width: 30px;
    border-radius: 10px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0.4em;
    right: 0.5em;
    width: 40px;
    height: 20px;
    font-size: 14px;
    margin-top: 1em !important;
    padding-left: 1em;
    padding-right: 1em;
    border: none;
    background-image: linear-gradient(to top right, #00B0E5, #00D2BC, #00E8A2);
    font-weight: 600;
    font-family: inherit !important;
    color: #031217;
  }

`;
