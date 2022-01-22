import { Spin } from "antd";
import React from "react";
import { useContext } from "react";
import { AppContext } from "../../App";
import { curveGradient, mediumBorder, mediumBorder2, softTextColor } from "../../styles";

import OwnedItem from "./OwnedItem";

const Mine = ({ grabables }) => {
  const { userAddress, fetching } = useContext(AppContext);

  const ownGrabables = grabables && grabables.filter(a => a.owner === userAddress);

  const emptyState = ownGrabables && ownGrabables.length === 0;
  if (emptyState) {
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
        {fetching ? <Spin size="large" /> : <div>You don't own any</div>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {ownGrabables.map(item => (
        <OwnedItem key={item.tokenId + "_" + item.uriHash + "_" + item.owner} item={item} />
      ))}
    </div>
  );
};

export default Mine;
