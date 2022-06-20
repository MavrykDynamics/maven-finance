import { Button } from '../../../app/App.components/Button/Button.controller'
// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ProposalBytesType,
} from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'

const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

type StageTwoFormViewProps = {
  locked: boolean
  form: ProposalUpdateForm
  fee: number
  successReward: number
  setForm: (form: ProposalUpdateForm) => void
  formInputStatus: ProposalUpdateFormInputStatus
  handleOnBlur: any
  handleUpdateProposal: () => void
  handleLockProposal: () => void
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
  handleLockProposal,
}: StageTwoFormViewProps) => {
  const handleCreateNewByte = () => {
    setForm({
      ...form,
      proposalBytes: [
        ...form.proposalBytes,
        {
          id: form.proposalBytes.length,
          title: '',
          data: '',
        },
      ],
    })
  }

  const handleChangeTitle = (index: number, text: string) => {
    const cloneProposalBytes = [...form.proposalBytes]
    cloneProposalBytes[index].title = text
    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  const handleChangeData = (index: number, text: string) => {
    const cloneProposalBytes = [...form.proposalBytes]
    cloneProposalBytes[index].data = text
    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 2</h1>
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
          <label>1- Enter Proposal Title</label>
          <FormTitleEntry>{form.title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <label>2- Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3- Fee</label>
          <FormTitleEntry>{fee}XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <div className="step-bytes">
        {form.proposalBytes.map((item: ProposalBytesType) => (
          <article key={item.id}>
            <div className="step-bytes-title">
              <label>
                <span>4{alphabet[item.id] || item.id}</span> - Enter Proposal Bytes Title
              </label>
              <Input
                type="text"
                value={item.title}
                onChange={(e: any) => handleChangeTitle(item.id, e.target.value)}
                onBlur={(e: any) => handleOnBlur(item.id, e.target.value, 'title')}
                inputStatus={formInputStatus.proposalBytes}
              />
            </div>

            <label>
              <span>4{alphabet[item.id] || item.id}</span> - Enter Proposal Bytes data
            </label>
            <TextArea
              type="text"
              className="step-2-textarea"
              value={item.data}
              onChange={(e: any) => handleChangeData(item.id, e.target.value)}
              onBlur={(e: any) => handleOnBlur(item.id, e.target.value, 'data')}
              inputStatus={formInputStatus.proposalBytes}
            />
          </article>
        ))}
        <StyledTooltip placement="top" title="Insert new bytes pair">
          <button onClick={handleCreateNewByte} className="step-plus-bytes">
            +
          </button>
        </StyledTooltip>
      </div>

      <FormButtonContainer>
        <Button
          icon="lock"
          className="lock"
          text={'Lock Proposal'}
          onClick={handleLockProposal}
          kind="actionSecondary"
        />
        <Button
          icon="bytes"
          className="bytes"
          text="Submit Bytes"
          kind="actionPrimary"
          onClick={handleUpdateProposal}
        />
      </FormButtonContainer>
    </>
  )
}
