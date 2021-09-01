import styled from 'styled-components';
import { Card } from 'antd';

export const ButtonContainer = styled(Card)`
  margin: 20px 0;

  > .ant-card-body {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  button {
    margin-left: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
`;

export const TableWrapper = styled.div`
  .ant-table {
    overflow: auto;
  }
`;

export const FilteredButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin: 20px 0;

  button {
    margin-left: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
`;
