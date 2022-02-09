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
    height: 30px;
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

export const DisconnectButton = ConnectButton;

export const ModalContent = styled.div`
  padding: 1em;
  border: none;
  background: inherit !important;
`;

export const ModalContentButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5em !important;
  padding-left: 1.5em;
  padding-right: 1.5em;

  :last-child {
    margin-bottom: 0.5em;
  }

  :hover {
    opacity: 0.8;
  }

  img {
    width: 30px;
    height: 30px;
    object-fit: contain;
  }
`;

export const ModalHeader = styled.div`
  padding: 1em;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: calc(.3rem - 1px);
  border-top-right-radius: calc(.3rem - 1px);

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0;
  }

  label:hover {
    cursor: pointer;
  }
`;
