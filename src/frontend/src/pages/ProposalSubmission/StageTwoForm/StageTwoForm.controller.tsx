import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageTwoFormProps, ValidationStateType, ProposalBytesType } from '../ProposalSybmittion.types'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { checkWhetherBytesIsValid, getBytesPairValidationStatus, PROPOSAL_BYTE } from '../ProposalSubmition.helpers'
import { updateProposal, deleteProposalDataPair } from '../ProposalSubmission.actions'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'

export const StageTwoForm = ({
  proposalId,
  currentProposal: { proposalData, title, locked },
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

  // effect to track chane of proposal, by tab clicking
  useEffect(() => {
    if (proposalData.length === 0) {
      handleCreateNewByte()
    }
    setBytesValidation(
      proposalData.map(({ id, title, encoded_code }) =>
        title && encoded_code
          ? {
              validTitle: proposalId >= 0 ? getBytesPairValidationStatus(title, 'validTitle', id, proposalData) : '',
              validBytes:
                proposalId >= 0 ? getBytesPairValidationStatus(encoded_code, 'validBytes', id, proposalData) : '',
              proposalId: id,
            }
          : {
              validTitle: 'success',
              validBytes: 'success',
              proposalId: id,
            },
      ),
    )
  }, [proposalId, proposalData])

  const [isBytesChanged, setBytesChanged] = useState<boolean>(false)

  const handleOnBlur = (byte: ProposalBytesType, text: string, type: 'validTitle' | 'validBytes') => {
    const validationStatus = getBytesPairValidationStatus(text, type, byte.id, proposalData)
    setBytesValidation(
      bytesValidation.map((validationObj) =>
        validationObj.proposalId === byte.id ? { ...validationObj, [type]: validationStatus } : validationObj,
      ),
    )
  }

  const handleOnCange = (byte: ProposalBytesType, text: string, type: 'title' | 'bytes') => {
    updateLocalProposalData(
      {
        proposalData: proposalData.map((oldByte) => (oldByte.id === byte.id ? { ...oldByte, [type]: text } : oldByte)),
      },
      proposalId,
    )
    setBytesChanged(true)
  }

  // add new bute pairs from local to server
  const submitBytePairs = async () => {
    if (bytesValidation.every(({ validBytes, validTitle }) => validBytes && validTitle)) {
      await dispatch(updateProposal(proposalData, proposalId))
    }
  }

  // adding new empty bytes pair
  const handleCreateNewByte = () => {
    updateLocalProposalData(
      {
        proposalData: [
          ...proposalData,
          {
            ...PROPOSAL_BYTE,
            id: proposalData.length + 1,
            order: proposalData.length + 1,
          },
        ],
      },
      proposalId,
    )
    setBytesChanged(true)
  }

  // removing bytes pair
  const handleDeletePair = (removeId: number) => {
    const pairToRemove = proposalData?.find((item) => item.id === removeId)
    if (pairToRemove && pairToRemove.title && pairToRemove.encoded_code) {
      if (pairToRemove?.isLocalBytes) {
        updateLocalProposalData(
          {
            proposalData: proposalData.filter(({ id }) => id !== removeId),
          },
          proposalId,
        )
      } else {
        dispatch(deleteProposalDataPair(pairToRemove.title, pairToRemove.encoded_code, proposalId))
      }
      setBytesChanged(true)
    }
  }

  // submit btn is disabled if no changes in bytes or if something is changed, but it doesn't pass the validation
  const submitBytesButtonDisabled = useMemo(() => {
    return (
      !isBytesChanged ||
      (isBytesChanged && !checkWhetherBytesIsValid(proposalData)) ||
      proposalData.length === 0 ||
      locked
    )
  }, [proposalData, isBytesChanged])

  // Drag & drop variables and event handlers
  const [dndBytes, setdndBytes] = useState<Array<ProposalBytesType>>([])

  useEffect(() => {
    setdndBytes(proposalData)
  }, [proposalData])

  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalBytesType | null>(null)
  const isDraggable = useMemo(() => proposalData.length > 1, [proposalData])

  // handling changing order of elements on drop event
  const dropHandler = (e: React.DragEvent<HTMLElement>, byteToDrop: ProposalBytesType) => {
    e.preventDefault()
    const updatedBytes = proposalData
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
        ...(bytePairId === byte.id && byte.id !== DnDSelectedProposal?.id ? { isUnderTheDrop: true } : {}),
      })),
    )
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
          <FormTitleEntry>{title}</FormTitleEntry>
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
          const existInServer = Boolean(proposalData?.find(({ id }) => item.id === id && !item.isLocalBytes))
          const validityObject = bytesValidation.find(({ proposalId }) => proposalId === item.id)

          if (!item.title || !item.encoded_code) return null

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
              <div className="idx">{i + 1}</div>
              <div className="step-bytes-title">
                <label>Enter Proposal Bytes Title</label>
                <Input
                  type="text"
                  value={item.title}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnCange(item, e.target.value, 'title')}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(item, e.target.value, 'validTitle')}
                  inputStatus={validityObject?.validTitle}
                  disabled={existInServer || locked}
                />
              </div>

              <label>Enter Proposal Bytes Title</label>
              <TextArea
                className="step-2-textarea"
                value={item.encoded_code}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnCange(item, e.target.value, 'bytes')}
                onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(item, e.target.value, 'validBytes')}
                inputStatus={validityObject?.validBytes}
                disabled={!isProposalPeriod || locked}
              />

              <div
                className={`remove-byte ${proposalData.length === 1 || !isProposalPeriod || locked ? 'disabled' : ''}`}
              >
                <StyledTooltip placement="top" title="Delete bytes pair">
                  <button onClick={() => handleDeletePair(item.id)} className="delete-button">
                    <Icon id="delete" />
                  </button>
                </StyledTooltip>
              </div>
            </article>
          )
        })}
        <StyledTooltip placement="top" title="Add bytes pair">
          <button disabled={!isProposalPeriod || locked} onClick={handleCreateNewByte} className="step-plus-bytes">
            +
          </button>
        </StyledTooltip>
      </div>

      <FormButtonContainer>
        <Button
          icon="close-stroke"
          className="close delete-pair"
          text="Drop Proposal"
          kind={ACTION_SECONDARY}
          onClick={() => handleDropProposal(proposalId)}
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
