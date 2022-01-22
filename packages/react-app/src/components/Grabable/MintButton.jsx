import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, InputNumber, Modal, Spin } from "antd";
import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import CustomAddressInput from "../CustomKit/CustomAddressInput";
import IntegerStep from "./IntegerStep";
import CreateModalFooter from "./CreateModalFooter";
import CreateModalSentOverlay from "./CreateModalSentOverlay";
import { primaryColor, softTextColor } from "../../styles";
import "./MintButton.css";
const { ethers } = require("ethers");

const MintButton = ({ grabable }) => {
  const { userSigner, gasPrice, writeContracts, contractConfig, localChainId, tx, userEthBalance, minMintPrice } =
    useContext(AppContext);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:

  const [visibleModal, setVisibleModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const minPrice = 1;
  const maxPrice = Math.floor(parseFloat(ethers.utils.formatUnits(userEthBalance)) * 1000);

  const [price, setPrice] = useState(1);
  const [premium, setPremium] = useState(0);

  const [priceError, setPriceError] = useState("");
  const [premiumError, setPremiumError] = useState([""]);

  const validateFields = () => {
    let ret = true;
    // if (!price) {
    //   setPriceError("Please input a price above the minimum.");
    //   ret = false;
    // }
    // if (!premium) {
    //   setPremiumError("Please input a premium no lower than 0");
    //   ret = false;
    // }
    return ret;
  };

  const resetMeself = () => {
    setExecuting(false);
    setPrice(1);
    setPriceError("");
    setPremium(0);
    setPremiumError("");
    setTxSent(false);
    setTxError(false);
    setTxSuccess(false);
  };

  const handleMint = async () => {
    try {
      const canGo = validateFields();

      if (!canGo) {
        return;
      }

      // TODO USE MODAL WITH INPUTS etc.
      const thePrice = ethers.utils.parseEther((price / 1000).toString());
      const thePremium = ethers.BigNumber.from(premium); // 10 %

      setExecuting(true);
      setTxError(false);
      tx(writeContracts.Grabable.mintItem(grabable.ipfsHash, thePremium, { value: thePrice }), update => {
        if (update && (update.error || update.reason)) {
          setExecuting(false);
          setTxError(true);
        }
        if (update && (update.status === "confirmed" || update.status === 1)) {
          // success
          setExecuting(false);
          setTxSuccess(true);
        }
        if (update && update.code) {
          // metamask error etc.
          setExecuting(false);
          setTxSent(false);
        }
      });
      setTxSent(true);
    } catch (e) {
      // error messages will appear in form
      console.log("SUBMIT FAILED: ", e);
    }
  };

  const handleCancel = () => {
    setVisibleModal(false);
    resetMeself();
  };

  const handleRetry = () => {
    setTxError(false);
    setTxSent(false);
  };

  const modalFooter = (
    <CreateModalFooter
      txSent={txSent}
      txError={txError}
      txSuccess={txSuccess}
      pendingCreate={executing}
      handleCancel={handleCancel}
      handleRetry={handleRetry}
      handleSubmit={handleMint}
    />
  );

  return (
    <div>
      <Button size="large" style={{ width: "7rem" }} onClick={() => setVisibleModal(true)}>
        Mint &amp; Buy
      </Button>

      <Modal
        destroyOnClose={true}
        title="Setup your Mint &amp; Buy"
        style={{ top: 120 }}
        visible={visibleModal}
        onOk={handleMint}
        onCancel={handleCancel}
        width="40rem"
        footer={modalFooter}
      >
        {txSent && (
          <CreateModalSentOverlay
            txError={txError}
            txSuccess={txSuccess}
            pendingText="Minting Item"
            successText="Item Minted"
            errorText="Transaction Failed"
          />
        )}
        <div
          style={{
            pointerEvents: txSent ? "none" : "all",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            paddingBottom: "2rem",
          }}
        >
          <Divider style={{ fontSize: "1.25rem" }}>Your Price</Divider>

          <div style={{ textAlign: "center", margin: "1rem auto", color: softTextColor }}>
            {" "}
            Author's minimum:{" "}
            <span style={{ fontWeight: 500, color: "#222" }}>{ethers.utils.formatEther(minMintPrice)} Ξ</span>
          </div>
          <div
            style={{
              margin: "auto",
            }}
          >
            <IntegerStep
              mi={minPrice}
              ma={maxPrice}
              step={(maxPrice - minPrice) / 100}
              update={setPrice}
              tipFormatter={v => `${(v / 1000).toFixed(4)} Ξ`}
              sliderWidth={`20rem`}
              leftText={
                <span>
                  Play it safe <span style={{ fontSize: "1.75rem" }}>🐣</span>
                </span>
              }
              rightText={
                <span>
                  <span style={{ fontSize: "1.75rem" }}>🏂</span> YOLO
                </span>
              }
              bottomText={"ETH"}
              displayValue={updater => v =>
                (
                  <InputNumber
                    className="primary-input"
                    min={minPrice / 1000}
                    max={maxPrice / 1000}
                    step={0.000001}
                    style={{ margin: "0 16px" }}
                    value={v / 1000}
                    onChange={v => updater(v * 1000)}
                  />
                )}
            />
          </div>

          <Divider style={{ fontSize: "1.25rem", marginTop: "4rem" }}>Grabber's Premium</Divider>

          <div
            style={{
              margin: "auto",
            }}
          >
            <IntegerStep
              mi={0}
              ma={10000}
              step={10}
              tipFormatter={v => Math.floor(v / 100) + "%"}
              update={setPremium}
              sliderWidth={`20rem`}
              leftText={
                <span>
                  Play it safe <span style={{ fontSize: "1.75rem" }}>🐣</span>
                </span>
              }
              rightText={
                <span>
                  <span style={{ fontSize: "1.75rem" }}>🏂</span> YOLO
                </span>
              }
              bottomText={"%"}
              displayValue={updater => v =>
                (
                  <InputNumber
                    className="primary-input"
                    min={0}
                    max={100}
                    step={0.01}
                    style={{ margin: "0 16px" }}
                    value={v / 100}
                    onChange={v => updater(v * 100)}
                  />
                )}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MintButton;
