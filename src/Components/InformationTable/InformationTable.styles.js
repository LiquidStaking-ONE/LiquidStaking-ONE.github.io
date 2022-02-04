import styled from 'styled-components';

export const Wrapper = styled.div`
  background-image: linear-gradient(
    to top right,
    #00B0E5,
    #00D2BC,
    #00E8A2);
  align-items: center;
  /* position: absolute; */
  /* justify-content: center; */
  padding: 1em;
  margin: 2em 1em 2em;
  color: #000;
  /* width: 100%; */
  height: 120px;
  border-radius: 10px;
`;

export const Content = styled.div`
  position: relative;
  /* flex-direction: row; */
  border: none !important;
  align-items: center;


  table {
    border: none;
    border-collapse: collapse;
    width: 100%;
    td, th {
      border: collapse;
      font-size: 13px;
    }
    .tr {
      text-align: right;
    }

  }
`;
