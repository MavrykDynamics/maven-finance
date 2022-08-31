import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { SubmitProposalForm, SubmitProposalFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
import { Info } from '../../../app/App.components/Info/Info.view'

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

type StageOneFormViewProps = {
  locked: boolean
  fee: number
  successReward: number
  form: SubmitProposalForm
  setForm: (form: SubmitProposalForm) => void
  formInputStatus: SubmitProposalFormInputStatus
  handleOnBlur: (e: React.ChangeEvent<HTMLInputElement>, formField: string) => void
  handleSubmitProposal: () => void
  proposalId: number | undefined
  proposalTitle: string
  proposalDescription: string
  proposalSourceCode: string
}
export const StageOneFormView = ({
  locked,
  fee,
  successReward,
  form,
  setForm,
  formInputStatus,
  handleOnBlur,
  handleSubmitProposal,
  proposalId,
  proposalDescription,
  proposalSourceCode,
  proposalTitle,
}: StageOneFormViewProps) => {
  const { watingProposals } = useGovernence()
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isProposalRound = governancePhase === 'PROPOSAL' && !watingProposals.length

  const disabled = Boolean(proposalId) || !isProposalRound

  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 1 </h1>
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
          {proposalTitle ? (
            <div>
              <label>1 - Proposal Title</label>
              <FormTitleEntry>{proposalTitle}</FormTitleEntry>
            </div>
          ) : (
            <>
              <label>1 - Enter Proposal Title</label>
              <Input
                type="text"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'TITLE')}
                inputStatus={formInputStatus.title}
                disabled={disabled}
              />
            </>
          )}
        </FormTitleContainer>
        <div>
          <label>2 - Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3 - Fee</label>
          <FormTitleEntry>{fee} XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      {proposalDescription ? (
        <div className="desr-block">
          <label>4 - Proposal Description</label>
          <FormTitleEntry>{proposalDescription}</FormTitleEntry>
        </div>
      ) : (
        <>
          <label>4 - Enter a description</label>
          <TextArea
            className="description-textarea"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
            onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(e, 'DESCRIPTION')}
            inputStatus={formInputStatus.description}
            disabled={disabled}
          />
        </>
      )}

      {proposalSourceCode ? (
        <div className="desr-block">
          <label>5 - Proposal source code</label>
          <FormTitleEntry>{proposalSourceCode}</FormTitleEntry>
        </div>
      ) : (
        <div className="source-code-input-wrap">
          <label>5 - Please add a link to the source code changes (if you have)</label>
          <Input
            type="text"
            value={form.sourceCodeLink}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sourceCodeLink: e.target.value })}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
            inputStatus={formInputStatus.sourceCodeLink}
            disabled={disabled}
          />
        </div>
      )}

      <FormButtonContainer>
        <Button
          icon="auction"
          kind="actionPrimary"
          disabled={disabled}
          text={'Submit Proposal'}
          onClick={handleSubmitProposal}
        />
      </FormButtonContainer>
    </>
  )
}
