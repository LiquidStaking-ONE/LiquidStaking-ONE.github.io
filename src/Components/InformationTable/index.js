import { Wrapper, Content } from './InformationTable.styles';


const InformationTable = (props) => {
  return (
    <Wrapper>
      <Content>
        <table>
          <tr>
            <td className= "tl">Balance</td>
            <td className= "tr">
              200
            </td>
          </tr>
          <tr >
            <td className= "tl">Locked</td>
            <td className= "tr">
              50
            </td>
          </tr>
          <tr>
            <td className= "tl">Exchange rate</td>
            <td className= "tr">1 </td>
          </tr>
          <tr>
            <td className= "tl">You will receive</td>
            <td className= "tr"> 200</td>
          </tr>

        </table>
      </Content>
    </Wrapper>
  )
};

export default InformationTable;
