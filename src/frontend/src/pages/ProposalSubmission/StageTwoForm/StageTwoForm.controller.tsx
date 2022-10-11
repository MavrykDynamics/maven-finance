import React, { useState, useEffect, useMemo } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalDataType } from '../../../utils/TypesAndInterfaces/Governance'
import type { ProposalUpdateFormProposalBytes } from '../../../utils/TypesAndInterfaces/Forms'

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

import { ProposalUpdateForm } from '../../../utils/TypesAndInterfaces/Forms'

import { dropProposal, updateProposal, deleteProposalDataPair } from '../ProposalSubmission.actions'

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
  id: 1,
  record_internal_id: 0,
  title: '',
  validTitle: '',
  validBytes: '',
  order: 1,
} as ProposalUpdateFormProposalBytes

export const StageTwoForm = ({ locked, proposalTitle, proposalId }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const { watingProposals } = useGovernence()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    governanceStorage: {
      fee,
      config: { successReward },
    },
    currentRoundProposals,
  } = useSelector((state: State) => state.governance)
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isProposalRound = governancePhase === 'PROPOSAL' && !watingProposals.length

  const findUserCurrentRoundProposal = useMemo(
    () => (accountPkh ? currentRoundProposals.find((item) => item.proposerId === accountPkh) : null),
    [accountPkh, currentRoundProposals],
  )

  const proposalData = findUserCurrentRoundProposal?.proposalData || []

  const [form, setForm] = useState<ProposalUpdateForm>({
    title: '',
    proposalBytes: [PROPOSAL_BYTE],
  })

  const disabled = !isProposalRound || !form.title

  // TODO: DnD proposals
  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalUpdateFormProposalBytes | null>(null)

  const [proposalBytesUpdate, setPoposalBytesUpdate] = useState<any[]>([])

  useEffect(() => {
    const proposalBytes = findUserCurrentRoundProposal?.proposalData?.length
      ? findUserCurrentRoundProposal?.proposalData.map((item) => {
          return { ...item, validTitle: '', validBytes: '' }
        })
      : [PROPOSAL_BYTE]
    setForm({
      title: proposalTitle,
      proposalBytes: proposalBytes as ProposalUpdateFormProposalBytes[],
    })
  }, [findUserCurrentRoundProposal, proposalTitle])

  // Bytes input handlers
  const handleOnBlur = (index: number, text: string, type: string) => {
    const cloneProposalBytes = JSON.parse(JSON.stringify(form.proposalBytes))

    if (type === 'title') {
      const isExistTitleInServer = proposalData.some((e) => e.title === text)
      cloneProposalBytes[index].validTitle = Boolean(text) && !isExistTitleInServer ? 'success' : 'error'
    }

    if (type === 'data') {
      cloneProposalBytes[index].validBytes = Boolean(text) ? 'success' : 'error'
    }
    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  const handleOnCange = (index: number, text: string, type: string) => {
    const cloneProposalBytes = JSON.parse(JSON.stringify(form.proposalBytes))

    if (type === 'title') {
      cloneProposalBytes[index].title = text
    }

    if (type === 'data') {
      cloneProposalBytes[index].bytes = text
    }

    setForm({ ...form, proposalBytes: cloneProposalBytes })
  }

  const clearState = (): void => {
    setForm({
      title: proposalTitle,
      proposalBytes: [PROPOSAL_BYTE],
    })
  }

  const handleAddProposal = async () => {
    const formIsValid = form.proposalBytes.every((item) => item.title && item.bytes)
    if (formIsValid) {
      await dispatch(updateProposal(form, proposalId, clearState))
    }
  }

  const prepareToUpdate = form.proposalBytes.filter((item) => {
    const findedInProposalData = proposalData.find((data) => data.id === item.id)
    return findedInProposalData?.title === item.title && findedInProposalData?.bytes === item.bytes ? null : item
  })

  const isCanEditProposal =
    prepareToUpdate.length && prepareToUpdate.every((item) => Boolean(item.title) && Boolean(item.bytes))
  const isNoOneError = form.proposalBytes.every((item) => item.validTitle !== 'error' && item.validBytes !== 'error')
  const isDisabledEdit = disabled || !isCanEditProposal || !isNoOneError

  const handleUpdateProposal = async () => {
    await dispatch(updateProposal({ title: form.title, proposalBytes: prepareToUpdate }, proposalId, clearState))
  }

  // Drop proposal on stage 2 handler
  // const handleDeleteProposal = async () => {
  //   if (proposalId) await dispatch(dropProposal(proposalId))
  // }

  const isAllBytesExist = form.proposalBytes.every((item) => Boolean(item.title) && Boolean(item.bytes))

  const isEdit = proposalData?.length

  const handleCreateNewByte = () => {
    setForm({
      ...form,
      proposalBytes: [
        ...form.proposalBytes,
        {
          id: form.proposalBytes.length + 1,
          bytes: '',
          governance_proposal_record_id: 0,
          record_internal_id: 0,
          title: '',
          validTitle: '',
          validBytes: '',
          order: form.proposalBytes.length + 1,
        },
      ],
    })
  }

  const handleDeletePair = (id: number, existInServer: boolean) => {
    if (existInServer) {
      const findOriginPair = proposalData.find((item) => item.id === id)
      if (findOriginPair) dispatch(deleteProposalDataPair(findOriginPair.title, findOriginPair.bytes, proposalId))
    } else {
      const findInOrigin = proposalData.find((item) => item.id === id)
      if (findInOrigin) {
        setPoposalBytesUpdate((prev) => {
          return prev.concat(findInOrigin)
        })
      }
      setForm({ ...form, proposalBytes: form.proposalBytes.filter((item) => item.id !== id) })
    }
  }

  // TODO: DnD handlers
  const isDraggable = useMemo(() => form.proposalBytes.length > 2, [form.proposalBytes])

  const dropHandler = (e: React.DragEvent<HTMLElement>, byte: ProposalUpdateFormProposalBytes) => {
    e.preventDefault()
  }

  const dragLeaveHandler = (e: React.DragEvent<HTMLElement>) => {}

  const dragEndHandler = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.style.background = 'none'
  }

  const dragStartHandler = (e: React.DragEvent<HTMLElement>, byte: ProposalUpdateFormProposalBytes) => {
    setDnDSeletedProposal(byte)
  }

  const dragOverHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.currentTarget.style.background = 'lightgrey'
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
          <label>1 - Enter Proposal Title</label>
          <FormTitleEntry>{form.title}</FormTitleEntry>
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
      <div className="step-bytes">
        {form.proposalBytes.map((item, i) => {
          const existInServer = Boolean(proposalData.find((data) => item.title === data.title && item.id === data.id))

          return (
            <article
              key={item.id}
              className={isDraggable ? 'draggabe' : ''}
              draggable={isDraggable}
              onDragEnd={dragEndHandler}
              onDragLeave={dragLeaveHandler}
              onDragStart={(e) => dragStartHandler(e, item)}
              onDragOver={dragOverHandler}
              onDrop={(e) => dropHandler(e, item)}
            >
              <div className="step-bytes-title">
                <label>
                  <span>{i + 4}a</span> - Enter Proposal Bytes Title
                </label>
                <Input
                  type="text"
                  value={item.title}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnCange(i, e.target.value, 'title')}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(i, e.target.value, 'title')}
                  inputStatus={item.validTitle}
                  disabled={disabled || existInServer}
                />
              </div>

              <label>
                <span>{i + 4}b</span> - Enter Proposal Bytes data
              </label>
              <TextArea
                className="step-2-textarea"
                value={item.bytes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnCange(i, e.target.value, 'data')}
                onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(i, e.target.value, 'data')}
                inputStatus={item.validBytes}
                disabled={disabled}
              />

              <Button
                icon="close-stroke"
                className="close delete-pair"
                text="Delete Proposal Byte Pair"
                kind="actionSecondary"
                onClick={() => handleDeletePair(item.id, existInServer)}
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
          <>
            {/* <Button
              icon="lock"
              className="lock"
              text="Delete Proposal"
              kind="actionSecondary"
              onClick={handleDeleteProposal}
            /> */}
            <Button
              icon="pencil-stroke"
              text="Edit Proposal"
              kind="actionPrimary"
              disabled={isDisabledEdit}
              onClick={handleUpdateProposal}
            />
          </>
        ) : (
          <Button
            icon="bytes"
            className="bytes"
            text="Submit Bytes"
            kind="actionPrimary"
            disabled={!isAllBytesExist}
            onClick={handleAddProposal}
          />
        )}
      </FormButtonContainer>
    </>
  )
}
