import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { dialogOverlayGradient, errorColor, primaryColor } from "../../styles";

const CreateModalSentOverlay = ({ txError, txSuccess, pendingText, successText, errorText }) => (
  <div
    style={{
      position: "absolute",
      zIndex: 10,
      top: 55,
      bottom: 53,
      left: 0,
      width: "100%",
      pointerEvents: "none",
      background: dialogOverlayGradient,
      backdropFilter: "blur(2px)",

      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
    }}
  >
    {txError && (
      <>
        <div style={{ fontSize: "1.5rem" }}>{errorText}</div>
        <StopOutlined style={{ color: errorColor, fontSize: "4rem" }} />
      </>
    )}
    {txSuccess && (
      <>
        <div style={{ fontSize: "1.5rem" }}>{successText}</div>
        <CheckCircleOutlined style={{ color: primaryColor, fontSize: "4rem" }} />
      </>
    )}
    {!txError && !txSuccess && (
      <>
        <div style={{ fontSize: "1.5rem" }}>{pendingText}</div>
        <div style={{ height: "4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spin size="large" style={{ transform: "scale(1.5)" }} />
        </div>
      </>
    )}
  </div>
);

export default CreateModalSentOverlay;
