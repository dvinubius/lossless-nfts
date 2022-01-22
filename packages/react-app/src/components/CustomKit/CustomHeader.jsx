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
        <div
          style={{
            fontSize: "2rem",
            transform: "translateY(0.125rem)",
            // background: "linear-gradient(90deg,  transparent, hsla(328,50%,50%,0.09), transparent)",
            padding: "0.1 25rem",
            color: softTextColor,
            marginLeft: "0.5rem",
          }}
        >
          <div className="logo"></div>
        </div>
      }
      subTitle={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#222",
            justifyContent: "center",
            fontSize: "1.25rem",
            letterSpacing: "0.1rem",
          }}
        >
          MINE! {/* ✨{" "} */}
          <div
            style={{ marginLeft: "0.5rem", marginRight: 0, transform: "rotateY(180deg) translateY(3px)" }}
            className="logo"
          ></div>
        </div>
      }
      style={{ cursor: "pointer", display: "flex", alignItems: "center", height: "54px", padding: "1rem" }}
    />
  );
}
