import { LockOutlined, SendOutlined, UnlockOutlined } from "@ant-design/icons";
import { Button, Card, List } from "antd";
import { useContractReader } from "eth-hooks";
import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../../App";
import { curveGradient, mediumBorder, mediumBorder2, softTextColor } from "../../styles";
import CustomAddress from "../CustomKit/CustomAddress";
import CustomAddressInput from "../CustomKit/CustomAddressInput";

const Mine = ({ grabables }) => {
  const { readContracts, userAddress, writeContracts, mainnetProvider } = useContext(AppContext);

  const balance = useContractReader(readContracts, "Grabable", "balanceOf", [userAddress]);
  console.log("🤗 balance:", balance);

  const [toAddress, setToAddress] = useState();

  const ownGrabables = grabables && grabables.filter(a => a.owner === userAddress);

  if (ownGrabables && ownGrabables.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30vh",
          fontSize: "1.25rem",
          color: softTextColor,
        }}
      >
        You don't own any
      </div>
    );
  }

  return (
    <List
      bordered
      dataSource={ownGrabables}
      renderItem={item => {
        const tokenId = item.tokenId.toNumber();
        return (
          <List.Item key={tokenId + "_" + item.uriHash + "_" + item.owner} style={{ padding: 0 }}>
            <div
              style={{
                background: curveGradient,
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                marginBottom: "2rem",
                borderBottom: mediumBorder,
              }}
            >
              <Card
                style={{ margin: "1rem" }}
                title={
                  <div>
                    <span style={{ fontSize: 16, marginRight: 8 }}>#{tokenId}</span> {item.name}
                  </div>
                }
              >
                <div>
                  <img src={item.image} style={{ maxWidth: 150 }} alt="" />
                </div>
                <div>{item.description}</div>
              </Card>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <CustomAddressInput
                    size="large"
                    wrapperStyle={{ width: "18rem" }}
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    value={toAddress}
                    onChange={setToAddress}
                  />

                  <Button
                    size="large"
                    style={{ width: "18rem" }}
                    onClick={() => {
                      console.log("writeContracts", writeContracts);
                      tx(writeContracts.Grabable.transferFrom(userAddress, toAddress, tokenId));
                    }}
                  >
                    Transfer <SendOutlined />
                  </Button>
                </div>
                {!item.locked && (
                  <Button size="large" style={{ width: "18rem" }}>
                    Lock <LockOutlined />
                  </Button>
                )}
                {item.locked && (
                  <Button size="large" style={{ width: "18rem" }}>
                    Unock <UnlockOutlined />
                  </Button>
                )}
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default Mine;
