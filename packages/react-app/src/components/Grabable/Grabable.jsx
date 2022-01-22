import React, { useContext, useState } from "react";
import { Button, Card, Divider } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
import CustomAddress from "../CustomKit/CustomAddress";
const { ethers } = require("ethers");
import { curveGradient, softTextColor, swapGradient } from "../../styles";
import CustomBalance from "../CustomKit/CustomBalance";
import MintButton from "./MintButton";

const Grabable = ({ item }) => {
  const { mainnetProvider, blockExplorer, tx, writeContracts, price, userAddress } = useContext(AppContext);
  const [executing, setExecuting] = useState(false);

  const handleGrab = async () => {
    setExecuting(true);
    tx(writeContracts.Grabable.grab(item.tokenId, { value: item.grabPrice }), update => {
      if (update && (update.error || update.reason)) {
        setExecuting(false);
      }
      if (update && (update.status === "confirmed" || update.status === 1)) {
        // success
        setExecuting(false);
      }
      if (update && update.code) {
        // metamask error etc.
        setExecuting(false);
      }
    });
  };

  const messageDisplay = (text, color) => (
    <div
      style={{
        height: 40,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );

  const cardAction = item.isMintable ? (
    <MintButton grabable={item} />
  ) : item.owner === userAddress ? (
    messageDisplay("You're the current owner", "deeppink")
  ) : item.isLocked ? (
    messageDisplay("Locked", softTextColor)
  ) : (
    <Button size="large" loading={executing} style={{ width: "7rem", color: "deeppink" }} onClick={handleGrab}>
      Grab!
    </Button>
  );

  return (
    <Card
      style={{
        maxWidth: "16rem",
        // background: swapGradient ,
        background: curveGradient,
        boxShadow: "rgb(244 244 244) 0px 3px 10px -1px",
      }}
      key={item.name}
      actions={[cardAction]}
      title={
        <div>
          {item.name}{" "}
          <a
            style={{ cursor: "pointer", opacity: 0.5, float: "right" }}
            href={item.external_url}
            target="_blank"
            rel="noreferrer"
          >
            <LinkOutlined />
          </a>
        </div>
      }
    >
      <img style={{ width: 130, minHeight: 130 }} src={item.image} alt="" />
      <div style={{ opacity: 0.77 }}>{item.description}</div>
      {!item.isMintable && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <Divider />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {"Owner"}
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <CustomAddress
                address={item.owner}
                fontSize={14}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
            </div>
          </div>
          {item.grabPrice && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Grab </span>
              <span>{<CustomBalance etherMode value={item.grabPrice} size={16} padding={0} price={price} />}</span>
            </div>
          )}
          {item.premium && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Premium </span>
              <span className="mono-nice" style={{ fontWeight: 500, fontSize: 16 }}>{`${
                item.premium.toNumber() / 100
              }%`}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
export default Grabable;
