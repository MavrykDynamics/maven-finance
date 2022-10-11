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
import { checkWtheterBytesIsValid, getBytesPairValidationStatus } from '../ProposalSubmition.helpers'

type StageTwoFormProps = {
  locked: boolean
  proposalId?: number
  proposalTitle: string
  proposalData?: ProposalDataType[]
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
  isUnderTheDrop: false,
} as ProposalUpdateFormProposalBytes

export const StageTwoForm = ({ locked, proposalTitle, proposalId, proposalData }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const { watingProposals } = useGovernence()
  const {
    governancePhase,
    governanceStorage: {
      fee,
      config: { successReward },
    },
  } = useSelector((state: State) => state.governance)

  const [form, setForm] = useState<ProposalUpdateForm>({
    title: proposalTitle,
    proposalBytes: proposalData?.length
      ? proposalData.map((item, idx) => ({
          ...PROPOSAL_BYTE,
          ...item,
          order: idx + 1,
        }))
      : [PROPOSAL_BYTE],
  })
  const [isBytesChanged, setBytesChanged] = useState<boolean>(false)

  // TODO: check this disable
  const disabled = !(governancePhase === 'PROPOSAL' && !watingProposals.length) || !form.title

  const handleOnBlur = (byte: ProposalUpdateFormProposalBytes, text: string, type: 'validTitle' | 'validBytes') => {
    const validationStatus = getBytesPairValidationStatus(text, type, byte.id, proposalData)
    setForm({
      ...form,
      proposalBytes: form.proposalBytes.map((formByte) =>
        formByte.id === byte.id ? { ...formByte, [type]: validationStatus } : formByte,
      ),
    })
  }

  const handleOnCange = (byte: ProposalUpdateFormProposalBytes, text: string, type: 'title' | 'bytes') => {
    setForm({
      ...form,
      proposalBytes: form.proposalBytes.map((formByte) =>
        formByte.id === byte.id ? { ...formByte, [type]: text } : formByte,
      ),
    })
  }

  const clearState = (): void => {
    setForm({
      title: proposalTitle,
      proposalBytes: [PROPOSAL_BYTE],
    })
    setBytesChanged(false)
  }

  // add new bute pairs from local to server
  const submitBytePairs = async () => {
    if (checkWtheterBytesIsValid(form.proposalBytes)) {
      await dispatch(updateProposal(form, proposalId, clearState))
    }
  }

  // TODO: remove it later if no need
  // const prepareToUpdate = form.proposalBytes.filter((item) => {
  //   const findedInProposalData = proposalData.find((data) => data.id === item.id)
  //   return findedInProposalData?.title === item.title && findedInProposalData?.bytes === item.bytes ? null : item
  // })

  // TODO: remove it later if no need
  // const handleUpdateProposal = async () => {
  //   await dispatch(updateProposal({ title: form.title, proposalBytes: prepareToUpdate }, proposalId, clearState))
  // }

  // Drop proposal on stage 2 handler
  // const handleDeleteProposal = async () => {
  //   if (proposalId) await dispatch(dropProposal(proposalId))
  // }

  // adding new empty bytes pair
  const handleCreateNewByte = () => {
    setForm({
      ...form,
      proposalBytes: [
        ...form.proposalBytes,
        {
          ...PROPOSAL_BYTE,
          id: form.proposalBytes.length + 1,
          order: form.proposalBytes.length + 1,
        },
      ],
    })
    setBytesChanged(true)
  }

  // removing bytes pair
  const handleDeletePair = (id: number) => {
    const findOriginPair = proposalData?.find((item) => item.id === id)
    if (findOriginPair) {
      dispatch(deleteProposalDataPair(findOriginPair.title, findOriginPair.bytes, proposalId))
    } else {
      setForm({
        ...form,
        proposalBytes: form.proposalBytes.filter(({ id: proposalToFilterId }) => id !== proposalToFilterId),
      })
    }
    setBytesChanged(true)
  }

  // submit btn is disabled if no changes in bytes or if something is changed, but it doesn't pass the validation
  const submitBytesButtonDisabled = useMemo(() => {
    return !isBytesChanged || (isBytesChanged && !checkWtheterBytesIsValid(form.proposalBytes))
  }, [form.proposalBytes, isBytesChanged])

  // Drag & drop variables and event handlers
  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalUpdateFormProposalBytes | null>(null)
  const isDraggable = useMemo(() => form.proposalBytes.length > 1, [form.proposalBytes])

  // handling changing order of elements on drop event
  const dropHandler = (e: React.DragEvent<HTMLElement>, byteToDrop: ProposalUpdateFormProposalBytes) => {
    e.preventDefault()
    setForm({
      ...form,
      proposalBytes: form.proposalBytes
        .map((byte) => {
          if (byte.id === byteToDrop.id) {
            return { ...byte, order: Number(DnDSelectedProposal?.order) }
          }

          if (byte.id === DnDSelectedProposal?.id) {
            return { ...byte, order: byteToDrop.order }
          }

          return byte
        })
        .sort((a, b) => a.order - b.order),
    })
    setBytesChanged(true)
  }

  // removing classNames for under grad event cards
  const dragRemoveStyling = () => {
    setForm({
      ...form,
      proposalBytes: form.proposalBytes.map((byte) => ({
        ...byte,
        isUnderTheDrop: false,
      })),
    })
  }

  // selecting card to drag
  const dragStartHandler = (byte: ProposalUpdateFormProposalBytes) => {
    setDnDSeletedProposal(byte)
  }

  // adding class names to under drag cards
  const dragOverHandler = (e: React.DragEvent<HTMLElement>, bytePairId: number) => {
    e.preventDefault()
    setForm({
      ...form,
      proposalBytes: form.proposalBytes.map((byte) => ({
        ...byte,
        ...(bytePairId === byte.id ? { isUnderTheDrop: true } : {}),
      })),
    })
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
          const existInServer = Boolean(proposalData?.find(({ id }) => item.id === id))

          return (
            <article
              key={item.id}
              className={`${isDraggable ? 'draggabe' : ''} ${item.isUnderTheDrop ? 'underDrop' : ''}`}
              draggable={isDraggable}
              onDragLeave={dragRemoveStyling}
              onDragEnd={dragRemoveStyling}
              onDragStart={() => dragStartHandler(item)}
              onDragOver={(e) => dragOverHandler(e, item.id)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnCange(item, e.target.value, 'title')}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(item, e.target.value, 'validTitle')}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnCange(item, e.target.value, 'bytes')}
                onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(item, e.target.value, 'validBytes')}
                inputStatus={item.validBytes}
                disabled={disabled}
              />

              <Button
                icon="close-stroke"
                className="close delete-pair"
                text="Delete Proposal Byte Pair"
                kind="actionSecondary"
                onClick={() => handleDeletePair(item.id)}
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
        {/* {isEdit ? (
          <>
            <Button
              icon="lock"
              className="lock"
              text="Delete Proposal"
              kind="actionSecondary"
              onClick={handleDeleteProposal}
            />
            <Button
              icon="pencil-stroke"
              text="Edit Proposal"
              kind="actionPrimary"
              disabled={isDisabledEdit}
              onClick={handleUpdateProposal}
            />
          </>
        ) : ( */}
        <Button
          icon="bytes"
          className="bytes"
          text="Submit Bytes"
          kind="actionPrimary"
          disabled={submitBytesButtonDisabled}
          onClick={submitBytePairs}
        />
        {/* )} */}
      </FormButtonContainer>
    </>
  )
}
