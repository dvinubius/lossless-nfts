import React from "react";
import { Slider, InputNumber, Row, Col, Input } from "antd";
import { useState } from "react";
import { softTextColor } from "../../styles";

const IntegerStep = ({ mi, ma, update, sliderWidth, leftText, rightText, bottomText, displayValue, tipFormatter }) => {
  const [inputValue, setInputValue] = useState(mi);

  const onChange = value => {
    if (isNaN(value)) {
      return;
    }
    setInputValue(value);
    update(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "1rem" }}>
      {leftText && (
        <div
          style={{
            color: "hsla(328, 100%, 74%)",
            fontSize: 14,
            flexGrow: 0,
            flexShrink: 0,
            minWidth: "6rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {leftText}
        </div>
      )}
      <div
        style={{
          flexGrow: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column ",
        }}
      >
        <div style={{ width: sliderWidth ?? "12rem" }}>
          <Slider
            min={mi}
            max={ma}
            onChange={onChange}
            value={typeof inputValue === "number" ? inputValue : 0}
            tipFormatter={tipFormatter}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {displayValue(onChange)(inputValue)}
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {bottomText}
          </div>
        </div>
      </div>
      {rightText && (
        <div
          style={{
            color: "hsla(328, 100%, 74%)",
            fontSize: 14,
            flexGrow: 0,
            flexShrink: 0,
            minWidth: "6rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          {rightText}
        </div>
      )}
    </div>
  );
};

export default IntegerStep;
