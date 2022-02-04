import React, { useState, useEffect, useRef } from 'react';

import { Wrapper, Content } from './InputBox.styles';
import ONELogo from '../../Images/one.png';

const InputBox = (setInputAmount) => {
  const [input, setInput] = useState('');
  const initial = useRef(true);

  return (
    <Wrapper>
      <Content>
        <img src={ONELogo} alt='ONE'/>
        <input
          type='text'
          placeholder='Search Movie'
          onChange={e => setInput(e.currentTarget.value)}
          value={input}
         />
         <button
           onClick={() => {setInput(100.0)}}
           style={{textTransform: "uppercase"}}>
            Max
          </button>
      </Content>
    </Wrapper>
  )
};

export default InputBox;
