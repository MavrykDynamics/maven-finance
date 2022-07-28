import { useSelector } from 'react-redux'
import { State } from 'reducers'
// types
import type { ProposalDataType } from '../../../utils/TypesAndInterfaces/Governance'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import {
  ProposalBytesType,
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
} from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

// hooks
import useGovernence from '../../Governance/UseGovernance'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'

type StageTwoFormViewProps = {
  locked: boolean
  form: ProposalUpdateForm
  fee: number
  proposalId: number | undefined
  successReward: number
  setForm: (form: ProposalUpdateForm) => void
  formInputStatus: ProposalUpdateFormInputStatus
  handleOnBlur: any
  handleUpdateProposal: () => void
  handleAddProposal: () => void
  proposalData: ProposalDataType[] | undefined
}
export const StageTwoFormView = ({
  locked,
  form,
  fee,
  successReward,
  setForm,
  formInputStatus,
  handleOnBlur,
  handleUpdateProposal,
  handleAddProposal,
  proposalId,
  proposalData,
}: StageTwoFormViewProps) => {
  const { watingProposals } = useGovernence()
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isProposalRound = governancePhase === 'PROPOSAL' && !watingProposals.length
  const disabled = !isProposalRound || !form.title

  const isAllTitleBytesExist = form.proposalBytes.every((item) => Boolean(item.title))
  const isAllBytesExist = form.proposalBytes.every((item) => Boolean(item.title) && Boolean(item.bytes))

  const isEdit = proposalData?.length

  const handleCreateNewByte = () => {
    setForm({
      ...form,
      proposalBytes: [
        ...form.proposalBytes,
        {
          id: form.proposalBytes.length,
          bytes: '',
          governance_proposal_record_id: 0,
          record_internal_id: 0,
          title: '',
        },
      ],
    })
  }

  const handleChangeTitle = (index: number, text: string) => {
    const cloneProposalBytes = [...form.proposalBytes]
    console.log('%c ||||| cloneProposalBytes', 'color:yellowgreen', cloneProposalBytes)
    cloneProposalBytes[index].title = text
    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  const handleChangeData = (index: number, text: string) => {
    const cloneProposalBytes = [...form.proposalBytes]
    cloneProposalBytes[index].bytes = text
    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 2 {!isProposalRound ? <span className="label">Not accessible in the current round</span> : null}</h1>
        <StatusFlag
          text={locked ? 'LOCKED' : 'UNLOCKED'}
          status={locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1 - Enter Proposal Title</label>
          <FormTitleEntry>{form.title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <label>2 - Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3 - Fee</label>
          <FormTitleEntry>{fee}XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <div className="step-bytes">
        {form.proposalBytes.map((item: ProposalDataType, i) => {
          console.log('%c ||||| item', 'color:yellowgreen', item)
          return (
            <article key={item.id}>
              <div className="step-bytes-title">
                <label>
                  <span>{i + 4}a</span> - Enter Proposal Bytes Title
                </label>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e: any) => handleChangeTitle(i, e.target.value)}
                  onBlur={(e: any) => handleOnBlur(i, e.target.value, 'title')}
                  inputStatus={isEdit ? '' : formInputStatus.title}
                  disabled={disabled}
                />
              </div>

              <label>
                <span>{i + 4}b</span> - Enter Proposal Bytes data
              </label>
              <TextArea
                type="text"
                className="step-2-textarea"
                value={item.bytes}
                onChange={(e: any) => handleChangeData(i, e.target.value)}
                onBlur={(e: any) => handleOnBlur(i, e.target.value, 'data')}
                inputStatus={isEdit ? '' : formInputStatus.proposalBytes}
                disabled={disabled}
              />
            </article>
          )
        })}
        <StyledTooltip placement="top" title="Insert new bytes pair">
          <button disabled={disabled} onClick={handleCreateNewByte} className="step-plus-bytes">
            +
          </button>
        </StyledTooltip>
      </div>

      <FormButtonContainer>
        {isEdit ? (
          <Button
            icon="pencil-stroke"
            text="Edit Proposal"
            kind="actionPrimary"
            disabled={disabled || !isAllTitleBytesExist}
            onClick={handleUpdateProposal}
          />
        ) : (
          <Button
            icon="bytes"
            className="bytes"
            text="Submit Bytes"
            kind="actionPrimary"
            disabled={disabled || !isAllBytesExist}
            onClick={handleAddProposal}
          />
        )}
      </FormButtonContainer>
    </>
  )
}
