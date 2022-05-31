import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import {
  EmergencyGovProposalModalButtons,
  EmergencyGovProposalModalContent,
  ModalFormContentContainer,
} from './EmergencyGovProposalModal.style'
import { FormTitleAndFeeContainer, FormTitleContainer } from '../../ProposalSubmission/ProposalSubmission.style'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

type EmergencyGovProposalModalViewProps = {
  loading: boolean
  showing: boolean
  submitEmergencyGovProposalCallback: (form: any) => void
  cancelCallback: () => void
  form: any
  formInputStatus: any
  setForm: (form: any) => void
  handleOnBlur: (e: any, formField: string) => void
}

export const EmergencyGovProposalModalView = ({
  loading,
  showing,
  submitEmergencyGovProposalCallback,
  cancelCallback,
  form,
  formInputStatus,
  setForm,
  handleOnBlur,
}: EmergencyGovProposalModalViewProps) => {
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask showing={showing} onClick={cancelCallback} />
          <ModalCard>
            <ModalClose onClick={cancelCallback}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#error" />
              </svg>
            </ModalClose>
            <ModalCardContent style={{ width: '750px' }}>
              <EmergencyGovProposalModalContent>
                <h1>Emergency Governance Proposal</h1>
                <ModalFormContentContainer>
                  <FormTitleAndFeeContainer>
                    <FormTitleContainer>
                      <label>1- Title</label>
                      <Input
                        type="text"
                        value={form.title}
                        onChange={(e: any) => setForm({ ...form, title: e.target.value })}
                        onBlur={(e: any) => handleOnBlur(e, 'TITLE')}
                        inputStatus={formInputStatus.title}
                      />
                    </FormTitleContainer>
                    <div>
                      <label>2- Enter MVK amount to trigger Break Glass</label>
                      <Input
                        type="number"
                        value={form.amountMVKtoTriggerBreakGlass}
                        onChange={(e: any) =>
                          setForm({ ...form, amountMVKtoTriggerBreakGlass: Number(e.target.value) })
                        }
                        onBlur={(e: any) => handleOnBlur(e, 'MVK_TRIGGER_AMOUNT')}
                        inputStatus={formInputStatus.amountMVKtoTriggerBreakGlass}
                      />
                    </div>
                  </FormTitleAndFeeContainer>

                  <label>3- Enter your description</label>
                  <TextArea
                    value={form.description}
                    onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                    onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
                    inputStatus={formInputStatus.description}
                  />
                  <div className="upload-wrap">
                    <IPFSUploader
                      typeFile="image"
                      imageIpfsUrl={form.screenshots}
                      setIpfsImageUrl={(e: any) => setForm({ ...form, screenshots: e })}
                      title={'Add pdf of screenshots (if relevant)'}
                      listNumber={4}
                    />
                  </div>
                </ModalFormContentContainer>
                <EmergencyGovProposalModalButtons>
                  <Button
                    text="Cancel"
                    kind="actionSecondary"
                    icon="error"
                    loading={loading}
                    onClick={cancelCallback}
                  />
                  <Button
                    text="Proceed"
                    kind="actionPrimary"
                    icon="auction"
                    loading={loading}
                    onClick={() => submitEmergencyGovProposalCallback({})}
                  />
                </EmergencyGovProposalModalButtons>
              </EmergencyGovProposalModalContent>
            </ModalCardContent>
          </ModalCard>
        </>
      )}
    </ModalStyled>
  )
}

EmergencyGovProposalModalView.propTypes = {
  loading: PropTypes.bool,
  showing: PropTypes.bool.isRequired,
  cancelCallback: PropTypes.func.isRequired,
  submitEmergencyGovProposalCallback: PropTypes.func.isRequired,
}

EmergencyGovProposalModalView.defaultProps = {
  loading: false,
}
