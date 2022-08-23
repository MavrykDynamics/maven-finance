import { MODAL_DATA } from "../Modal.data";
import { ModalCard, ModalCardContent } from "styles";
import { Button } from "../../Button/Button.controller";
import * as React from "react";
import { EGovModalHeader } from "./EmergencyGovernanceActiveModal.style";

export const EmergencyGovernanceActiveModal = ({
  loading,
  cancelCallback,
}: {
  loading: boolean;
  cancelCallback: any;
}) => {
  const { title, subTitle, content } = MODAL_DATA.get("emergency-governance");
  return (
    <ModalCard>
      <ModalCardContent width={50}>
        <EGovModalHeader>{title}</EGovModalHeader>
        <div>{subTitle}</div>
        <div>{content}</div>
        <Button
          text="Acknowledge"
          kind="primary"
          icon="check"
          loading={loading}
          onClick={cancelCallback}
        />
      </ModalCardContent>
    </ModalCard>
  );
};
