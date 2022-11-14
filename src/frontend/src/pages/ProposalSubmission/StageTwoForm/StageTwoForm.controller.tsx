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
import {
  checkBytesPairExists,
  getBytesDiff,
  getBytesPairValidationStatus,
  PROPOSAL_BYTE,
} from '../ProposalSubmition.helpers'
import { updateProposalData } from '../ProposalSubmission.actions'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { isValidLength } from 'utils/validatorFunctions'
import { isHexadecimal } from 'utils/validatorFunctions'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'

// valiv bytes text: 05050505080508050805050505050505080505050507070017050505050508030b

export const StageTwoForm = ({
  proposalId,
  currentProposal: { proposalData = [], title, locked },
  updateLocalProposalData,
  handleDropProposal,
  currentOriginalProposal,
  setProposalHasChange,
  proposalHasChange,
}: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const {
    governancePhase,
    governanceStorage: {
      fee,
      config: { successReward, proposalMetadataTitleMaxLength },
    },
  } = useSelector((state: State) => state.governance)
  const isProposalPeriod = governancePhase === 'PROPOSAL'
  const [bytesValidation, setBytesValidation] = useState<ValidationStateType>([])
  const isAllBytesValid = useMemo(
    () =>
      bytesValidation.every(
        ({ validBytes, validTitle }) => validBytes === INPUT_STATUS_SUCCESS && validTitle === INPUT_STATUS_SUCCESS,
      ),
    [proposalHasChange, bytesValidation],
  )

  // effect to track change of proposal, by tab clicking, and default validate it
  useEffect(() => {
    if (!proposalData.some(checkBytesPairExists)) {
      handleCreateNewByte()
    }

    setBytesValidation(
      proposalData.reduce<ValidationStateType>((acc, { id, title, encoded_code }) => {
        if (title && encoded_code) {
          acc.push({
            validTitle: proposalId >= 0 ? getBytesPairValidationStatus(title, 'validTitle') : '',
            validBytes: proposalId >= 0 ? getBytesPairValidationStatus(encoded_code, 'validBytes') : '',
            pairId: id,
          })
        }

        return acc
      }, []),
    )
  }, [proposalId, proposalData])

  const handleOnBlur = (byte: ProposalBytesType, text: string, type: 'validTitle' | 'validBytes') => {
    let validationStatus: 'success' | 'error'

    if (type === 'validTitle') {
      const defaultMaxLength = 100
      validationStatus =
        isValidLength(text, 1, proposalMetadataTitleMaxLength || defaultMaxLength) &&
        getBytesPairValidationStatus(text, type) === 'success'
          ? 'success'
          : 'error'
    } else {
      validationStatus =
        isHexadecimal(text) && getBytesPairValidationStatus(text, type) === 'success' ? 'success' : 'error'
    }

    setBytesValidation(
      bytesValidation.map((validationObj) =>
        validationObj.pairId === byte.id ? { ...validationObj, [type]: validationStatus } : validationObj,
      ),
    )
  }

  const handleOnChange = (byte: ProposalBytesType, text: string, type: 'title' | 'encoded_code') => {
    updateLocalProposalData(
      {
        proposalData: proposalData.map((oldByte) =>
          oldByte.id === byte.id ? { ...oldByte, [type === 'title' ? 'title' : 'encoded_code']: text } : oldByte,
        ),
      },
      proposalId,
    )
    setProposalHasChange(true)
  }

  const submitBytePairs = async () => {
    if (proposalId && isAllBytesValid && currentOriginalProposal) {
      const bytesDiff = getBytesDiff(currentOriginalProposal.proposalData, proposalData)
      console.log('bytesDiff', bytesDiff)
      await dispatch(updateProposalData(proposalId, bytesDiff))
    }
  }

  // adding new empty bytes pair
  const handleCreateNewByte = () => {
    const newId = Date.now()
    const newOrder = Math.max(...proposalData.map(({ order }) => order), 0) + 1
    // add bytes pair to actual proposal data to display it to user
    updateLocalProposalData(
      {
        proposalData: [
          ...proposalData,
          {
            ...PROPOSAL_BYTE,
            id: newId,
            order: newOrder,
          },
        ],
      },
      proposalId,
    )
    setProposalHasChange(true)
  }

  // removing bytes pair
  const handleDeletePair = (removeId: number) => {
    const pairToRemove = proposalData.find(({ id }) => removeId === id)

    if (pairToRemove) {
      updateLocalProposalData(
        {
          proposalData: proposalData.filter(({ id }) => id !== removeId),
        },
        proposalId,
      )
      setProposalHasChange(true)
    }
  }

  // submit btn is disabled if no changes in bytes or if something is changed, but it doesn't pass the validation
  const submitBytesButtonDisabled = useMemo(
    () => !proposalHasChange || (!proposalHasChange && !isAllBytesValid) || locked,
    [locked, proposalHasChange, isAllBytesValid],
  )

  // Drag & drop variables and event handlers
  const [dndBytes, setdndBytes] = useState<Array<ProposalBytesType>>([])
  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalBytesType | null>(null)
  const isDraggable = useMemo(() => proposalData?.length > 1, [proposalData])

  useEffect(() => {
    setdndBytes(proposalData)
  }, [proposalData])

  // handling changing order of elements on drop event
  const dropHandler = (e: React.DragEvent<HTMLElement>, byteToDrop: ProposalBytesType) => {
    e.preventDefault()
    if (DnDSelectedProposal) {
      // reordered and saved client bytes that user sees
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
    }
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
          if (!checkBytesPairExists(item)) return null

          const existInServer = Boolean(proposalData?.find(({ id }) => item.id === id && !item.isLocalBytes))
          const validityObject = bytesValidation.find(({ pairId }) => pairId === item.id)

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
                  value={item.title ?? ''}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(item, e.target.value, 'title')}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(item, e.target.value, 'validTitle')}
                  inputStatus={validityObject?.validTitle}
                  disabled={existInServer || locked}
                />
              </div>

              <label>Enter Proposal Bytes Data</label>
              <TextArea
                className="step-2-textarea"
                value={item.encoded_code ?? ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleOnChange(item, e.target.value, 'encoded_code')
                }
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
