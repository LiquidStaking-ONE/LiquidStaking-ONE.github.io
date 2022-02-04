import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 2em;
  display:flex;
  justify-content: center;
  align-items: center;
  color: #000;
  max-width: 450px;
  height: 600px;


  h1{
      margin-bottom: 0.5em !important;
      font-size: 35px !important;
      font-weight: 500 !important;
      text-align: center;
      color: #00D2BC;
  }
  `;


export const Content = styled.div`
  display:flex
  position:relative;
  flex-direction: column;
  display: flex;
  height: 450px;
  border-radius: 10px;
  background: #10252c !important;
`;
