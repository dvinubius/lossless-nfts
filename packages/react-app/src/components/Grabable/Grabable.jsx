import React, { useContext, useState } from "react";
import { Button, Card, Divider } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
import CustomAddress from "../CustomKit/CustomAddress";
const { ethers } = require("ethers");
import { curveGradient, swapGradient } from "../../styles";
import CustomBalance from "../CustomKit/CustomBalance";
import MintButton from "./MintButton";

const Grabable = ({ grabable }) => {
  const { mainnetProvider, blockExplorer, tx, writeContracts, price, userAddress } = useContext(AppContext);
  const [executing, setExecuting] = useState(false);

  const handleGrab = async () => {
    setExecuting(true);
    tx(writeContracts.Grabable.grab(grabable.tokenId, { value: grabable.grabPrice }), update => {
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

  const cardAction = grabable.isMintable ? (
    <MintButton grabable={grabable} />
  ) : grabable.owner === userAddress ? (
    <div
      style={{
        height: 40,
        color: "deeppink",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}
    >
      You're the current owner{" "}
    </div>
  ) : (
    <Button
      size="large"
      // type="primary"
      loading={executing}
      style={{ width: "7rem", color: "deeppink" }}
      onClick={handleGrab}
    >
      Grab!
    </Button>
  );

  return (
    <Card
      style={{
        maxWidth: "16rem",
        // background: swapGradient ,
        background: curveGradient,
      }}
      key={grabable.name}
      actions={[cardAction]}
      title={
        <div>
          {grabable.name}{" "}
          <a
            style={{ cursor: "pointer", opacity: 0.5, float: "right" }}
            href={grabable.external_url}
            target="_blank"
            rel="noreferrer"
          >
            <LinkOutlined />
          </a>
        </div>
      }
    >
      <img style={{ width: 130, minHeight: 130 }} src={grabable.image} alt="" />
      <div style={{ opacity: 0.77 }}>{grabable.description}</div>
      <Divider />
      {!grabable.isMintable && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {"Owner"}
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <CustomAddress
                address={grabable.owner}
                fontSize={14}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
            </div>
          </div>
          {grabable.grabPrice && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Grab </span>
              <span>{<CustomBalance etherMode value={grabable.grabPrice} size={16} padding={0} price={price} />}</span>
            </div>
          )}
          {grabable.premium && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Premium </span>
              <span className="mono-nice" style={{ fontWeight: 500, fontSize: 16 }}>{`${
                grabable.premium.toNumber() / 100
              }%`}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
export default Grabable;
