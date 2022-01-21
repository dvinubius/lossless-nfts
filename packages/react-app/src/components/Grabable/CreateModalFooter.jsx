import { Button } from "antd";
const { mediumButtonMinWidth } = require("../../styles");

const CreateModalFooter = ({ txSent, txError, txSuccess, pendingCreate, handleCancel, handleRetry, handleSubmit }) => {
  return txSent
    ? [
        <Button key={1} type="default" style={{ minWidth: mediumButtonMinWidth }} onClick={handleCancel}>
          {txSuccess ? "Thanks" : "Close"}
        </Button>,
        txError && (
          <Button key={2} type="primary" style={{ minWidth: mediumButtonMinWidth }} onClick={handleRetry}>
            Retry
          </Button>
        ),
      ]
    : [
        <Button key={1} type="default" style={{ minWidth: mediumButtonMinWidth }} onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key={2}
          type="primary"
          style={{ minWidth: mediumButtonMinWidth }}
          loading={pendingCreate}
          onClick={handleSubmit}
        >
          Submit
        </Button>,
      ];
};

export default CreateModalFooter;
