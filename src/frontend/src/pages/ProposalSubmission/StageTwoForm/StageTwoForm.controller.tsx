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
import { checkWhetherBytesIsValid, getBytesPairValidationStatus, PROPOSAL_BYTE } from '../ProposalSubmition.helpers'
import { updateProposalData } from '../ProposalSubmission.actions'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

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
  proposalChangesState,
  setProposalsChangesState,
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
  const currentBytesChanges = useMemo(
    () => proposalChangesState?.[proposalId]?.proposalDataChanges,
    [proposalId, proposalChangesState],
  )

  // effect to track change of proposal, by tab clicking, and default validate it
  useEffect(() => {
    if (proposalData.length === 0) {
      handleCreateNewByte()
    }
    setBytesValidation(
      proposalData.map(({ id, title, encoded_code, isLocalBytes }) => ({
        validTitle: isLocalBytes ? getBytesPairValidationStatus(title, 'validTitle') : INPUT_STATUS_SUCCESS,
        validBytes: getBytesPairValidationStatus(encoded_code, 'validBytes'),
        proposalId: id,
      })),
    )
  }, [proposalId, proposalData])

  // INPUT HANDLERS: doing validation on input blur
  const handleOnBlur = (byte: ProposalBytesType, text: string, type: 'validTitle' | 'validBytes') => {
    const validationStatus = getBytesPairValidationStatus(text, type)
    setBytesValidation(
      bytesValidation.map((validationObj) =>
        validationObj.proposalId === byte.id ? { ...validationObj, [type]: validationStatus } : validationObj,
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

    const updatedChanges = currentBytesChanges
      .map((item) => {
        if (byte.id === item?.addOrSetProposalData?.localId) {
          item.addOrSetProposalData[type === 'encoded_code' ? 'encodedCode' : type] = text
        }

        return item
      })
      .concat(
        currentBytesChanges.find((item) => item?.addOrSetProposalData?.localId === byte.id)
          ? []
          : [
              {
                addOrSetProposalData: {
                  title: type === 'title' ? text : byte.title,
                  encodedCode: type === 'encoded_code' ? text : byte.encoded_code,
                  codeDescription: '',
                  localId: byte.id,
                  index: proposalData.findIndex(({ id }) => id === byte.id)?.toString(),
                },
              },
            ],
      )

    // setProposalsChangesState({
    //   ...proposalChangesState,
    //   [proposalId]: {
    //     ...proposalChangesState[proposalId],
    //     proposalDataChanges: updatedChanges,
    //   },
    // })
  }

  // adding new bytes to server | updating bytes | saving order
  const submitBytePairs = async () => {
    if (
      proposalId &&
      bytesValidation.find(({ validBytes, validTitle }) => validBytes !== ERROR && validTitle !== ERROR)
    ) {
      const removeAll = proposalData.map((_, idx) => ({ removeProposalData: idx.toString() }))
      const actualChanges = proposalData.map(({ title, encoded_code }) => ({
        addOrSetProposalData: {
          title: title,
          encodedCode: encoded_code,
          codeDescription: '',
        },
      }))
      // await dispatch(updateProposalData(currentBytesChanges, proposalId))
      await dispatch(updateProposalData(removeAll, actualChanges, proposalId))
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
    // add bytes pair to changes that are user do save this later onto back-end
    // setProposalsChangesState({
    //   ...proposalChangesState,
    //   [proposalId]: {
    //     ...proposalChangesState[proposalId],
    //     proposalDataChanges: [
    //       ...currentBytesChanges,
    //       {
    //         addOrSetProposalData: {
    //           title: '',
    //           encodedCode: '',
    //           codeDescription: '',
    //           localId: newId,
    //         },
    //       },
    //     ],
    //   },
    // })
  }

  // removing bytes pair
  const handleDeletePair = (removeId: number) => {
    const pairToRemove = proposalData.find(({ id }) => removeId === id)

    if (pairToRemove) {
      // removing added bytes pair from proposal data to display
      updateLocalProposalData(
        {
          proposalData: proposalData.filter(({ id }) => id !== removeId),
        },
        proposalId,
      )

      // removing added bytes pair from changes arr, if bytes pair is not local we need to add removing query to stack
      const filteredChanges = currentBytesChanges
        .filter((item) => !(pairToRemove.isLocalBytes && item?.addOrSetProposalData?.localId === removeId))
        .concat(!pairToRemove.isLocalBytes ? [{ removeProposalData: pairToRemove.order.toString() }] : [])
      // setProposalsChangesState({
      //   ...proposalChangesState,
      //   [proposalId]: {
      //     ...proposalChangesState[proposalId],
      //     proposalDataChanges: filteredChanges,
      //   },
      // })
    }
  }

  // submit btn is disabled if no changes in bytes or if something is changed, but it doesn't pass the validation
  const submitBytesButtonDisabled = useMemo(() => {
    return (
      // !currentBytesChanges.length ||
      // (currentBytesChanges.length && !checkWhetherBytesIsValid(proposalData)) ||
      // proposalData.length === 0 ||
      locked
    )
  }, [proposalData, currentBytesChanges])

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

      // adding parts for query for reordering it on backend
      // setProposalsChangesState({
      //   ...proposalChangesState,
      //   [proposalId]: {
      //     ...proposalChangesState[proposalId],
      //     proposalDataChanges: currentBytesChanges
      //       .filter(({ addOrSetProposalData: { localId = null } = {} }) => localId !== DnDSelectedProposal.id)
      //       .filter(({ addOrSetProposalData: { localId = null } = {} }) => localId !== byteToDrop.id)
      //       .concat([
      //         {
      //           addOrSetProposalData: {
      //             title: DnDSelectedProposal?.title,
      //             encodedCode: DnDSelectedProposal?.encoded_code,
      //             codeDescription: '',
      //             index: proposalData.findIndex(({ id }) => id === byteToDrop.id).toString(),
      //             localId: DnDSelectedProposal.id,
      //           },
      //         },
      //         {
      //           addOrSetProposalData: {
      //             title: byteToDrop.title,
      //             encodedCode: byteToDrop.encoded_code,
      //             codeDescription: '',
      //             index: proposalData.findIndex(({ id }) => id === DnDSelectedProposal.id).toString(),
      //             localId: byteToDrop.id,
      //           },
      //         },
      //       ]),
      //   },
      // })
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
          const existInServer = Boolean(proposalData?.find(({ id }) => item.id === id && !item.isLocalBytes))
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
              <div className="idx">{i + 1}</div>
              <div className="step-bytes-title">
                <label>Enter Proposal Bytes Title</label>
                <Input
                  type="text"
                  value={item.title}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(item, e.target.value, 'title')}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(item, e.target.value, 'validTitle')}
                  inputStatus={validityObject?.validTitle}
                  disabled={existInServer || locked}
                />
              </div>

              <label>Enter Proposal Bytes Title</label>
              <TextArea
                className="step-2-textarea"
                value={item.encoded_code}
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
