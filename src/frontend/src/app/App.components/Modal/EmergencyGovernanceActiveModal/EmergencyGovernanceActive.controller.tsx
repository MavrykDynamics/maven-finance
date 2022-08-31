import { MODAL_DATA } from '../Modal.data'
import { ModalCard, ModalCardContent } from 'styles'
import { Button } from '../../Button/Button.controller'
import * as React from 'react'
import { EGovModalHeader } from './EmergencyGovernanceActiveModal.style'

export type ModalDataType = { title: string; subTitle: string; content: string }

export const EmergencyGovernanceActiveModal = ({
  loading,
  cancelCallback,
}: {
  loading: boolean
  cancelCallback: (e: React.MouseEvent<HTMLElement>) => void
}) => {
  const { title, subTitle, content } = MODAL_DATA.get('emergency-governance') as ModalDataType
  return (
    <ModalCard>
      <ModalCardContent width={50}>
        <EGovModalHeader>{title}</EGovModalHeader>
        <div>{subTitle}</div>
        <div>{content}</div>
        <Button text="Acknowledge" kind="primary" icon="check" loading={loading} onClick={cancelCallback} />
      </ModalCardContent>
    </ModalCard>
  )
}
