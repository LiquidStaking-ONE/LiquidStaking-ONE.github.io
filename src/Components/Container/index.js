import React from  'react';
import { Wrapper, Content } from './Container.styles';
import InputBox from '../InputBox';
import InformationTable from '../InformationTable';
import SubmitButton from '../SubmitButton';

const Component = () => (
    <Wrapper>
      <h1>Liquid Staking</h1>
      <Content>
        <InputBox/>
        <InformationTable/>
        <SubmitButton/>
      </Content>
    </Wrapper>
);

export default Component;
