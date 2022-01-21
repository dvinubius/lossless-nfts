import { List } from "antd";
import React, { useContext } from "react";
import CustomAddress from "../CustomKit/CustomAddress";
import { AppContext } from "../../App";

const Grabs = ({ transferEvents }) => {
  const { readContracts, localProvider, mainnetProvider } = useContext(AppContext);

  return (
    <List
      bordered
      dataSource={transferEvents}
      renderItem={item => {
        return (
          <List.Item key={item[0] + "_" + item[1] + "_" + item.blockNumber + "_" + item.args[2].toNumber()}>
            <span style={{ fontSize: 16, marginRight: 8 }}>#{item.args[2].toNumber()}</span>
            <CustomAddress address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> =&gt;
            <CustomAddress address={item.args[1]} ensProvider={mainnetProvider} fontSize={16} />
          </List.Item>
        );
      }}
    />
  );
};
export default Grabs;
