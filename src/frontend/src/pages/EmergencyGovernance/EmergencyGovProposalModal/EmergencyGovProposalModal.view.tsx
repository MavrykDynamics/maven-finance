import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import {
  EmergencyGovProposalModalButtons,
  EmergencyGovProposalModalContent,
  ModalFormContentContainer,
} from './EmergencyGovProposalModal.style'
import {
  FormSubTitle,
  FormTitleAndFeeContainer,
  FormTitleContainer,
} from '../../ProposalSubmission/ProposalSubmission.style'
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
            <ModalCardContent>
              <EmergencyGovProposalModalContent>
                <h1>Emergency Governance Proposal</h1>
                <ModalFormContentContainer>
                  <FormTitleAndFeeContainer>
                    <FormTitleContainer>
                      <FormSubTitle>1- Title</FormSubTitle>
                      <Input
                        type="text"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e: any) => setForm({ ...form, title: e.target.value })}
                        onBlur={(e: any) => handleOnBlur(e, 'TITLE')}
                        inputStatus={formInputStatus.title}
                      />
                    </FormTitleContainer>
                    <div>
                      <FormSubTitle>2- Enter MVK amount to trigger Break Glass</FormSubTitle>
                      <Input
                        type="number"
                        placeholder="Success MVK Reward"
                        value={form.amountMVKtoTriggerBreakGlass}
                        onChange={(e: any) =>
                          setForm({ ...form, amountMVKtoTriggerBreakGlass: Number(e.target.value) })
                        }
                        onBlur={(e: any) => handleOnBlur(e, 'MVK_TRIGGER_AMOUNT')}
                        inputStatus={formInputStatus.amountMVKtoTriggerBreakGlass}
                      />
                    </div>
                  </FormTitleAndFeeContainer>

                  <FormSubTitle>3- Enter your description</FormSubTitle>
                  <TextArea
                    placeholder="Proposal Description"
                    value={form.description}
                    onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                    onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
                    inputStatus={formInputStatus.description}
                  />
                  <IPFSUploader
                    imageIpfsUrl={form.screenshots}
                    setIpfsImageUrl={(e: any) => setForm({ ...form, screenshots: e })}
                    title={'Add pdf of screenshots (if relevant)'}
                    listNumber={4}
                  />
                </ModalFormContentContainer>
                <EmergencyGovProposalModalButtons>
                  <Button text="Cancel" kind="secondary" icon="error" loading={loading} onClick={cancelCallback} />
                  <Button
                    text="Proceed"
                    icon="success"
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
