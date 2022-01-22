import { LinkOutlined, LockOutlined, SendOutlined, UnlockOutlined } from "@ant-design/icons";
import { Button, Card, Divider } from "antd";
import { useContext, useState } from "react";
import { AppContext } from "../../App";
import { curveGradient, mediumBorder, primaryColor, softBorder, softBorder2, softTextColor } from "../../styles";
import CustomAddressInput from "../CustomKit/CustomAddressInput";
import CustomBalance from "../CustomKit/CustomBalance";

const OwnedItem = ({ item }) => {
  const { readContracts, userAddress, writeContracts, mainnetProvider, tx, price } = useContext(AppContext);

  const [toAddress, setToAddress] = useState();
  const [executingLock, setExecutingLock] = useState(false);

  const handleLock = async item => {
    try {
      setExecutingLock(true);
      tx(writeContracts.Grabable.lockToken(item.tokenId, { value: item.lockFee }), update => {
        if (update && (update.error || update.reason)) {
          setExecutingLock(false);
        }
        if (update && (update.status === "confirmed" || update.status === 1)) {
          // success
          setExecutingLock(false);
        }
        if (update && update.code) {
          // metamask error etc.
          setExecutingLock(false);
        }
      });
    } catch (e) {
      console.log("LOCKING FAILED: ", e);
    }
  };

  const handleUnlock = async item => {
    try {
      setExecutingLock(true);
      tx(writeContracts.Grabable.unlockToken(item.tokenId), update => {
        if (update && (update.error || update.reason)) {
          setExecutingLock(false);
        }
        if (update && (update.status === "confirmed" || update.status === 1)) {
          // success
          setExecutingLock(false);
        }
        if (update && update.code) {
          // metamask error etc.
          setExecutingLock(false);
        }
      });
    } catch (e) {
      console.log("UNLOCKING FAILED: ", e);
    }
  };

  const lockUnlockButton = item => (
    <Button
      size="large"
      loading={executingLock}
      style={{ width: "18rem" }}
      onClick={item.isLocked ? () => handleUnlock(item) : () => handleLock(item)}
    >
      {item.isLocked ? "Unlock " : "Lock"} {item.isLocked ? <UnlockOutlined /> : <LockOutlined />}
    </Button>
  );

  return (
    <div
      style={{
        background: curveGradient,
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        border: softBorder,
        borderRadius: 4,
        boxShadow: "rgb(244 244 244) 0px 3px 10px -1px",
      }}
    >
      <Card
        style={{ margin: "1rem" }}
        title={
          <div>
            <span>
              <span style={{ fontSize: 16, marginRight: 8 }}>#{item.tokenId.toNumber()}</span> {item.name}
            </span>
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
        <div>
          <img src={item.image} style={{ maxWidth: 150 }} alt="" />
        </div>
        <div>{item.description}</div>
      </Card>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <div
          style={{
            // flex: 1,
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
              tx(writeContracts.Grabable.transferFrom(userAddress, toAddress, item.tokenId));
            }}
          >
            Transfer <SendOutlined />
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", padding: "0 2rem" }}>
          {item.grabPrice && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Grab Price</span>
              <span>{<CustomBalance etherMode value={item.grabPrice} size={16} padding={0} price={price} />}</span>
            </div>
          )}
          {item.premium && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Premium </span>
                <span className="mono-nice" style={{ fontWeight: 500, fontSize: 16 }}>{`${
                  item.premium.toNumber() / 100
                }%`}</span>
              </div>
              {!item.isLocked && (
                <>
                  <Divider style={{ margin: "0.5rem 0 " }}></Divider>
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}
                  >
                    <span style={{}}>On grab you get</span>
                    <span className="mono-nice" style={{ fontWeight: 500, fontSize: 16, color: "deeppink" }}>
                      {
                        <CustomBalance
                          etherMode
                          value={item.grabPrice.mul(item.premium).div(10000)}
                          size={16}
                          padding={0}
                          price={price}
                        />
                      }
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {lockUnlockButton(item)}
      </div>
    </div>
  );
};
export default OwnedItem;
