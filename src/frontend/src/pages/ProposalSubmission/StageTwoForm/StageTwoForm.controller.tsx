import React, { useState, useMemo, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import type { ProposalUpdateFormProposalBytes } from '../../../utils/TypesAndInterfaces/Forms'
import { ProposalUpdateForm } from '../../../utils/TypesAndInterfaces/Forms'

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
  checkWtheterBytesIsValid,
  getBytesPairValidationStatus,
  PROPOSAL_BYTE,
  setDefaultProposalBytes,
} from '../ProposalSubmition.helpers'
import { updateProposal, deleteProposalDataPair } from '../ProposalSubmission.actions'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { ChangeProposalFnType } from '../ProposalSubmission.controller'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

type StageTwoFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  updateLocalProposalData: ChangeProposalFnType
  handleDropProposal: (proposalId: number) => void
}

type ValidationStateType = {
  validTitle: InputStatusType
  validBytes: InputStatusType
  proposalId: number
}[]

type ProposalBytesType = ProposalRecordType['proposalData'][number]

export const StageTwoForm = ({
  proposalId,
  currentProposal,
  updateLocalProposalData,
  handleDropProposal,
}: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const {
    governancePhase,
    governanceStorage: {
      fee,
      config: { successReward },
    },
  } = useSelector((state: State) => state.governance)
  const isProposalPeriod = governancePhase === 'PROPOSAL'
  const [bytesValidation, setBytesValidation] = useState<ValidationStateType>([])

  useEffect(() => {
    if (currentProposal.proposalData.length === 0) {
      handleCreateNewByte()
    }
    setBytesValidation(
      currentProposal.proposalData.map(({ id, title, bytes }) => ({
        validTitle: getBytesPairValidationStatus(title, 'validTitle', id, currentProposal.proposalData),
        validBytes: getBytesPairValidationStatus(bytes, 'validBytes', id, currentProposal.proposalData),
        proposalId: id,
      })),
    )
  }, [proposalId])

  // const [proposalBytes, setProposalBytes] = useState<ProposalUpdateForm>([PROPOSAL_BYTE])
  const [isBytesChanged, setBytesChanged] = useState<boolean>(false)

  const handleOnBlur = (byte: ProposalBytesType, text: string, type: 'validTitle' | 'validBytes') => {
    const validationStatus = getBytesPairValidationStatus(text, type, byte.id, currentProposal.proposalData)
    setBytesValidation(
      bytesValidation.map((validationObj) =>
        validationObj.proposalId === byte.id ? { ...validationObj, [type]: validationStatus } : validationObj,
      ),
    )
  }

  const handleOnCange = (byte: ProposalBytesType, text: string, type: 'title' | 'bytes') => {
    updateLocalProposalData(
      {
        proposalData: currentProposal.proposalData.map((oldByte) =>
          oldByte.id === byte.id ? { ...oldByte, [type]: text } : oldByte,
        ),
      },
      proposalId,
    )
    setBytesChanged(true)
  }

  // add new bute pairs from local to server
  const submitBytePairs = async () => {
    if (bytesValidation.every(({ validBytes, validTitle }) => validBytes && validTitle)) {
      await dispatch(updateProposal(currentProposal.proposalData, proposalId))
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

  // adding new empty bytes pair
  const handleCreateNewByte = () => {
    updateLocalProposalData(
      {
        proposalData: [
          ...currentProposal.proposalData,
          {
            ...PROPOSAL_BYTE,
            id: currentProposal.proposalData.length + 1,
            order: currentProposal.proposalData.length + 1,
          },
        ],
      },
      proposalId,
    )
    setBytesChanged(true)
  }

  // removing bytes pair
  const handleDeletePair = (removeId: number) => {
    const pairToRemove = currentProposal.proposalData?.find((item) => item.id === removeId)
    if (pairToRemove) {
      if (pairToRemove?.isLocalBytes) {
        updateLocalProposalData(
          {
            proposalData: currentProposal.proposalData.filter(({ id }) => id !== removeId),
          },
          proposalId,
        )
      } else {
        dispatch(deleteProposalDataPair(pairToRemove.title, pairToRemove.bytes, proposalId))
      }
      setBytesChanged(true)
    }
  }

  // submit btn is disabled if no changes in bytes or if something is changed, but it doesn't pass the validation
  const submitBytesButtonDisabled = useMemo(() => {
    return !isBytesChanged || (isBytesChanged && !checkWtheterBytesIsValid(currentProposal.proposalData))
  }, [currentProposal, isBytesChanged])

  // Drag & drop variables and event handlers
  const [dndBytes, setdndBytes] = useState<Array<ProposalBytesType>>([])

  useEffect(() => {
    setdndBytes(currentProposal.proposalData)
  }, [currentProposal])

  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalBytesType | null>(null)
  const isDraggable = useMemo(() => currentProposal.proposalData.length > 1, [currentProposal.proposalData])

  // handling changing order of elements on drop event
  const dropHandler = (e: React.DragEvent<HTMLElement>, byteToDrop: ProposalBytesType) => {
    e.preventDefault()
    const updatedBytes = currentProposal.proposalData
      .map((byte) => {
        if (byte.id === byteToDrop.id) {
          return { ...byte, order: Number(DnDSelectedProposal?.order) }
        }

        if (byte.id === DnDSelectedProposal?.id) {
          return { ...byte, order: byteToDrop.order }
        }

        return byte
      })
      .sort((a, b) => a.order - b.order)

    setdndBytes(updatedBytes)

    updateLocalProposalData(
      {
        proposalData: updatedBytes,
      },
      proposalId,
    )
    setBytesChanged(true)
  }

  // removing classNames for under grad event cards
  const dragRemoveStyling = () => {
    setdndBytes(
      dndBytes.map((byte) => ({
        ...byte,
        isUnderTheDrop: false,
      })),
    )
  }

  // selecting card to drag
  const dragStartHandler = (byte: ProposalBytesType) => {
    setDnDSeletedProposal(byte)
  }

  // adding class names to under drag cards
  const dragOverHandler = (e: React.DragEvent<HTMLElement>, bytePairId: number) => {
    e.preventDefault()
    setdndBytes(
      dndBytes.map((byte) => ({
        ...byte,
        ...(bytePairId === byte.id ? { isUnderTheDrop: true } : {}),
      })),
    )
  }

  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 2</h1>
        <StatusFlag
          text={currentProposal.locked ? 'LOCKED' : 'UNLOCKED'}
          status={currentProposal.locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1 - Enter Proposal Title</label>
          <FormTitleEntry>{currentProposal.title}</FormTitleEntry>
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
        {dndBytes.map((item, i) => {
          const existInServer = Boolean(
            currentProposal.proposalData?.find(({ id }) => item.id === id && !item.isLocalBytes),
          )
          const validityObject = bytesValidation.find(({ proposalId }) => proposalId === item.id)

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
                  inputStatus={validityObject?.validTitle}
                  disabled={existInServer}
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
                inputStatus={validityObject?.validBytes}
                disabled={!isProposalPeriod}
              />

              <Button
                icon="close-stroke"
                className="close delete-pair"
                text="Delete Proposal Byte Pair"
                kind={ACTION_SECONDARY}
                onClick={() => handleDeletePair(item.id)}
              />
            </article>
          )
        })}
        <StyledTooltip placement="top" title="Insert new bytes pair">
          <button disabled={!isProposalPeriod} onClick={handleCreateNewByte} className="step-plus-bytes">
            +
          </button>
        </StyledTooltip>
      </div>

      <FormButtonContainer>
        <Button
          icon="close-stroke"
          className="close delete-pair"
          text="Delete Proposal"
          kind={ACTION_SECONDARY}
          onClick={() => handleDropProposal(proposalId)}
        />

        <Button
          icon="pencil-stroke"
          text="Edit Proposal"
          kind={ACTION_PRIMARY}
          disabled={!isProposalPeriod}
          onClick={() => console.log('update proposal')}
          // onClick={handleUpdateProposal}
        />
        <Button
          icon="bytes"
          className="bytes"
          text="Submit Bytes"
          kind={ACTION_PRIMARY}
          disabled={submitBytesButtonDisabled}
          onClick={submitBytePairs}
        />
      </FormButtonContainer>
    </>
  )
}
