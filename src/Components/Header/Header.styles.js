// @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700&display=swap');
import styled from 'styled-components';

export const Wrapper = styled.div`
  background: #031217;
  padding: 0 20px;
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 10px;
  border-bottom: 1px solid #CCC;
`;

export const LogoImg = styled.img`
  width: 55px;
  height: 55px;
  @media screen and (max-width: 500px ) {
    width: 30px;
  }
`;

export const ConnectButton = styled.button`
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  :hover {
    opacity: 0.8;
  }

  @media screen and (max-width: 500px) {
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
