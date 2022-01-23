import { SwapOutlined } from "@ant-design/icons";
import { PageHeader } from "antd";
import React from "react";
import { mediumBorder3, softTextColor } from "../../styles";
import "./CustomHeader.css";

// displays a page header

export default function CustomHeader() {
  return (
    <PageHeader
      className="CustomHeader"
      title={
        <div className="alive-border">
          <div className="title-text">LossLess</div>
        </div>
      }
      style={{ cursor: "pointer", display: "flex", alignItems: "center", height: "54px", padding: "1rem" }}
    />
  );
}
