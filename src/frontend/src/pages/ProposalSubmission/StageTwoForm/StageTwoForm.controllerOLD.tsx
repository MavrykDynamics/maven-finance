import { useState, useEffect, useMemo } from 'react'

import { useDispatch, useSelector } from 'react-redux'
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

// hooks
import useGovernence from '../../Governance/UseGovernance'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ValidProposalUpdateForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { validateFormAndThrowErrors } from '../../../utils/validatorFunctions'

import { dropProposal, updateProposal } from '../ProposalSubmission.actions'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'

type StageTwoFormProps = {
  locked: boolean
  accountPkh?: string
  proposalId: number | undefined
  proposalTitle: string
  proposalData?: ProposalDataType[] | undefined
}

export const PROPOSAL_BYTE = {
  bytes: '',
  governance_proposal_record_id: 0,
  id: 0,
  record_internal_id: 0,
  title: '',
  valid: '',
}

export const StageTwoForm = ({ locked, proposalTitle, proposalId }: StageTwoFormProps) => {
  return null
  // const dispatch = useDispatch()
  // const { accountPkh } = useSelector((state: State) => state.wallet)
  // const { governanceStorage, currentRoundProposals } = useSelector((state: State) => state.governance)
  // const { fee, currentRound } = governanceStorage

  // const { watingProposals } = useGovernence()
  // const { governancePhase } = useSelector((state: State) => state.governance)
  // const isProposalRound = governancePhase === 'PROPOSAL' && !watingProposals.length
  // const successReward = governanceStorage.config.successReward
  // console.log('%c ||||| currentRoundProposals', 'color:yellowgreen', currentRoundProposals)
  // const findUserCurrentRoundProposal = useMemo(
  //   () => (accountPkh ? currentRoundProposals.find((item) => item.proposerId === accountPkh) : null),
  //   [accountPkh, currentRoundProposals],
  // )
  // console.log('%c ||||| findUserCurrentRoundProposal', 'color:yellowgreen', findUserCurrentRoundProposal)
  // const proposalData = findUserCurrentRoundProposal?.proposalData

  // const [form, setForm] = useState<ProposalUpdateForm>({
  //   title: '',
  //   proposalBytes: [PROPOSAL_BYTE],
  // })

  // useEffect(() => {
  //   console.log('%c ||||| 1111', 'color:red', 1111)
  //   setForm({
  //     title: proposalTitle,
  //     proposalBytes: findUserCurrentRoundProposal?.proposalData?.length
  //       ? findUserCurrentRoundProposal?.proposalData
  //       : [PROPOSAL_BYTE],
  //   })
  // }, [findUserCurrentRoundProposal, proposalTitle])
  // console.log('%c ||||| proposalData', 'color:yellowgreen', proposalData)
  // const disabled = !isProposalRound || !form.title
  // console.log('%c ||||| JSON.stringify(proposalData)', 'color:yellowgreen', JSON.stringify(proposalData))
  // console.log('%c ||||| JSON.stringify(form.proposalBytes)', 'color:yellowgreen', JSON.stringify(form.proposalBytes))
  // console.log(
  //   '%c ||||| JSON.stringify(form.proposalBytes) === JSON.stringify(proposalData)',
  //   'color:yellowgreen',
  //   JSON.stringify(form.proposalBytes) === JSON.stringify(proposalData),
  // )
  // const isDisabledEdit = disabled || JSON.stringify(form.proposalBytes) === JSON.stringify(proposalData)

  // const [validForm, setValidForm] = useState<ValidProposalUpdateForm>({
  //   title: false,
  //   proposalBytes: false,
  // })
  // const [formInputStatus, setFormInputStatus] = useState<ProposalUpdateFormInputStatus>({
  //   title: '',
  //   proposalBytes: '',
  // })

  // const handleOnBlur = (index: number, text: string, type: string) => {
  //   const validityCheckResultData = Boolean(text)
  //   const validityCheckResultText = Boolean(text)

  //   if (type === 'title') {
  //     setValidForm({ ...validForm, title: validityCheckResultText })
  //     const updatedState = { ...validForm, title: validityCheckResultText }
  //     setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
  //   }

  //   if (type === 'data') {
  //     setValidForm({ ...validForm, proposalBytes: validityCheckResultData })
  //     const updatedState = { ...validForm, proposalBytes: validityCheckResultData }
  //     setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
  //   }
  // }

  // const clearState = (): void => {
  //   setForm({
  //     title: proposalTitle,
  //     proposalBytes: [PROPOSAL_BYTE],
  //   })
  //   setValidForm({
  //     title: false,
  //     proposalBytes: false,
  //   })
  //   setFormInputStatus({
  //     title: '',
  //     proposalBytes: '',
  //   })
  // }

  // const handleAddProposal = async () => {
  //   const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
  //   if (formIsValid) {
  //     await dispatch(updateProposal(form, proposalId, clearState))
  //   }
  // }

  // const handleUpdateProposal = async () => {
  //   await dispatch(updateProposal(form, proposalId, clearState))
  // }

  // const handleDeleteProposal = async () => {
  //   if (proposalId) await dispatch(dropProposal(proposalId))
  // }

  // const isAllTitleBytesExist = form.proposalBytes.every((item) => Boolean(item.title))
  // const isAllBytesExist = form.proposalBytes.every((item) => Boolean(item.title) && Boolean(item.bytes))

  // const isEdit = proposalData?.length

  // const handleCreateNewByte = () => {
  //   setForm({
  //     ...form,
  //     proposalBytes: [
  //       ...form.proposalBytes,
  //       {
  //         id: form.proposalBytes.length,
  //         bytes: '',
  //         governance_proposal_record_id: 0,
  //         record_internal_id: 0,
  //         title: '',
  //       },
  //     ],
  //   })
  // }

  // const handleChangeTitle = (index: number, text: string) => {
  //   const cloneProposalBytes = JSON.parse(JSON.stringify(form.proposalBytes))
  //   cloneProposalBytes[index].title = text
  //   setForm({ ...form, proposalBytes: cloneProposalBytes })
  // }

  // const handleChangeData = (index: number, text: string) => {
  //   const cloneProposalBytes = JSON.parse(JSON.stringify(form.proposalBytes))
  //   cloneProposalBytes[index].bytes = text
  //   setForm({ ...form, proposalBytes: cloneProposalBytes })
  // }

  // return (
  //   <>
  //     <FormHeaderGroup>
  //       <h1>Stage 2</h1>
  //       <StatusFlag
  //         text={locked ? 'LOCKED' : 'UNLOCKED'}
  //         status={locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
  //       />
  //       <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
  //         <Icon id="question" />
  //       </a>
  //     </FormHeaderGroup>
  //     <FormTitleAndFeeContainer>
  //       <FormTitleContainer>
  //         <label>1 - Enter Proposal Title</label>
  //         <FormTitleEntry>{form.title}</FormTitleEntry>
  //       </FormTitleContainer>
  //       <div>
  //         <label>2 - Proposal Success Reward</label>
  //         <FormTitleEntry>{successReward} MVK</FormTitleEntry>
  //       </div>
  //       <div>
  //         <label>3 - Fee</label>
  //         <FormTitleEntry>{fee} XTZ</FormTitleEntry>
  //       </div>
  //     </FormTitleAndFeeContainer>
  //     <div className="step-bytes">
  //       {form.proposalBytes.map((item: ProposalDataType, i) => {
  //         return (
  //           <article key={item.id}>
  //             <div className="step-bytes-title">
  //               <label>
  //                 <span>{i + 4}a</span> - Enter Proposal Bytes Title
  //               </label>
  //               <Input
  //                 type="text"
  //                 value={item.title}
  //                 required
  //                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeTitle(i, e.target.value)}
  //                 onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(i, e.target.value, 'title')}
  //                 inputStatus={''}
  //                 // inputStatus={isEdit ? '' : formInputStatus.title}
  //                 disabled={disabled}
  //               />
  //             </div>

  //             <label>
  //               <span>{i + 4}b</span> - Enter Proposal Bytes data
  //             </label>
  //             <TextArea
  //               className="step-2-textarea"
  //               value={item.bytes}
  //               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChangeData(i, e.target.value)}
  //               onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(i, e.target.value, 'data')}
  //               inputStatus={''}
  //               // inputStatus={isEdit ? '' : formInputStatus.title}
  //               disabled={disabled}
  //             />
  //             {/* <Button
  //               icon="close-stroke"
  //               className="close"
  //               text="Delete Proposal Byte Pair"
  //               kind="actionSecondary"
  //               onClick={handleDeleteProposal}
  //             /> */}
  //           </article>
  //         )
  //       })}
  //       <StyledTooltip placement="top" title="Insert new bytes pair">
  //         <button disabled={disabled} onClick={handleCreateNewByte} className="step-plus-bytes">
  //           +
  //         </button>
  //       </StyledTooltip>
  //     </div>

  //     <FormButtonContainer>
  //       {isEdit ? (
  //         <>
  //           <Button
  //             icon="lock"
  //             className="lock"
  //             text="Delete Proposal"
  //             kind="actionSecondary"
  //             onClick={handleDeleteProposal}
  //           />
  //           <Button
  //             icon="pencil-stroke"
  //             text="Edit Proposal"
  //             kind="actionPrimary"
  //             disabled={isDisabledEdit}
  //             onClick={handleUpdateProposal}
  //           />
  //         </>
  //       ) : (
  //         <Button
  //           icon="bytes"
  //           className="bytes"
  //           text="Submit Bytes"
  //           kind="actionPrimary"
  //           disabled={disabled}
  //           onClick={handleAddProposal}
  //         />
  //       )}
  //     </FormButtonContainer>
  //   </>
  // )
}
