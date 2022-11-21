import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { MultyProposalItem, MultyProposals } from './MultyProposals/MultyProposals.controller'
import { FormButtonContainer, ProposalSubmissionForm } from './ProposalSubmission.style'
import { Page } from 'styles'

// types
import { State } from 'reducers'
import { CurrentRoundProposalsStorageType } from 'utils/TypesAndInterfaces/Governance'
import { ProposalValidityObj, SubmittedProposalsMapper } from './ProposalSybmittion.types'

// helpers
import {
  DEFAULT_PROPOSAL,
  DEFAULT_PROPOSAL_VALIDATION,
  getBytesDiff,
  getPaymentsDiff,
} from './ProposalSubmition.helpers'
import { dropProposal, lockProposal, submitProposal, updateProposalData } from './ProposalSubmission.actions'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { isValidLength } from 'utils/validatorFunctions'
import { Button } from 'app/App.components/Button/Button.controller'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposals,
    governancePhase,
    governanceStorage: {
      fee,
      config: { proposalTitleMaxLength, proposalDescriptionMaxLength },
    },
  } = useSelector((state: State) => state.governance)
  const { whitelistTokens, dipDupTokens } = useSelector((state: State) => state.tokens)

  const [activeTab, setActiveTab] = useState(1)
  const [selectedUserProposalId, setSeletedUserProposalId] = useState(-1)

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  const [proposalKeys, mappedProposals, mappedValidation] = useMemo(() => {
    const { keys, mapper, validityObj } = currentRoundProposals
      .filter((item) => item.proposerId === accountPkh)
      .reduce<SubmittedProposalsMapper>(
        (acc, proposal) => {
          acc.mapper[proposal.id] = proposal
          acc.validityObj[proposal.id] = {
            title: '',
            description: '',
            sourceCode: '',
            ipfs: '',
            successMVKReward: '',
            invoiceTable: '',
            bytesValidation: proposal.proposalData.map((bytesPair) => ({
              validBytes: '',
              validTitle: '',
              byteId: bytesPair.id,
            })),
            paymentsValidation: proposal.proposalPayments.map((payment) => ({
              token_amount: '',
              title: '',
              to__id: '',
              paymentId: payment.id,
            })),
          }
          acc.keys.push(proposal.id)
          return acc
        },
        { keys: [], mapper: {}, validityObj: {} },
      )
    setSeletedUserProposalId(keys?.[0])
    return [keys, mapper, validityObj]
  }, [accountPkh, currentRoundProposals, proposalDescriptionMaxLength, proposalTitleMaxLength])

  // mapping user created proposals to buttons data
  const usersProposalsToSwitch = useMemo(
    () =>
      (proposalKeys || [])
        .map<MultyProposalItem>((id) => ({
          text: mappedProposals[id].title,
          active: id === selectedUserProposalId,
          value: id,
        }))
        .concat(
          proposalKeys.length < 2
            ? [{ text: 'Create new Proposal', active: selectedUserProposalId === -1, value: -1 }]
            : [],
        ),
    [selectedUserProposalId, proposalKeys, mappedProposals],
  )

  const paymentMethods = useMemo(
    () =>
      whitelistTokens
        .map((tokenInfo) => ({
          symbol: tokenInfo.contract_name,
          address: tokenInfo.contract_address,
          shortSymbol: tokenInfo.token_contract_standard,
          id: 0,
        }))
        .filter(({ shortSymbol }) => ['fa2', 'fa12', 'tez'].includes(shortSymbol)),
    [whitelistTokens],
  )

  const [proposalState, setProposalsState] = useState(mappedProposals)
  const [proposalsValidation, setProposalsValidation] = useState<Record<number, ProposalValidityObj>>({})
  const [proposalHasChange, setProposalHasChange] = useState(false)
  const currentOriginalProposal = useMemo(
    () => currentRoundProposals.find(({ id }) => selectedUserProposalId === id),
    [selectedUserProposalId, currentRoundProposals],
  )

  const handleChangeTab = useCallback((tabId?: number) => {
    setActiveTab(tabId ?? 0)
  }, [])

  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      setSeletedUserProposalId(proposalId)

      // it means that we choose create new proposal
      if (proposalId === -1 && !proposalState[-1]) {
        setProposalsState({
          ...proposalState,
          ...(proposalState[DEFAULT_PROPOSAL.id]
            ? { [DEFAULT_PROPOSAL.id - 1]: DEFAULT_PROPOSAL }
            : { [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL }),
        })
      }
    },
    [proposalState],
  )

  const updateLocalProposalData = useCallback(
    (newProposalData: Partial<CurrentRoundProposalsStorageType[number]>, proposalId: number) => {
      setProposalsState({
        ...proposalState,
        [proposalId]: {
          ...proposalState[proposalId],
          ...newProposalData,
        },
      })
    },
    [proposalState],
  )

  const updateLocalProposalValidation = useCallback(
    (newProposalValidation: Partial<ProposalValidityObj>, proposalId: number) => {
      setProposalsValidation({
        ...proposalsValidation,
        [proposalId]: {
          ...proposalsValidation[proposalId],
          ...newProposalValidation,
        },
      })
    },
    [proposalsValidation],
  )

  const handleLockProposal = async (proposalId: number) => {
    await dispatch(lockProposal(proposalId))
  }

  const handleDropProposal = async (proposalId: number) => {
    if (proposalId && proposalId !== -1) await dispatch(dropProposal(proposalId))
  }

  const handleUpdateData = async (proposalId: number) => {
    const bytesDiff = getBytesDiff(currentOriginalProposal?.proposalData ?? [], currentProposal.proposalData)
    const paymentsDiff = getPaymentsDiff(
      currentOriginalProposal?.proposalPayments ?? [],
      currentProposal.proposalPayments,
      paymentMethods,
      dipDupTokens,
    )
    await dispatch(updateProposalData(proposalId, bytesDiff, paymentsDiff))
  }

  const handleSubmitProposal = async () => {
    // TODO: add also setting stage 2 and stage 3 stuff when submitting proposal
    await dispatch(
      submitProposal(
        {
          title: currentProposal.title,
          description: currentProposal.description,
          sourceCode: currentProposal.sourceCode,
          ipfs: '',
        },
        fee,
      ),
    )
  }

  // if user removed all his submitted proposals, show him create proposal tab with empty proposal form to fill up
  useEffect(() => {
    setProposalsState(
      proposalKeys.length
        ? mappedProposals
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
          },
    )
    setProposalsValidation(
      proposalKeys.length
        ? mappedValidation
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL_VALIDATION,
          },
    )
    setSeletedUserProposalId(proposalKeys?.[0] ?? DEFAULT_PROPOSAL.id)
  }, [mappedProposals, mappedValidation, proposalKeys])

  const [currentProposal, currentProposalValidation] = useMemo(
    () => [proposalState[selectedUserProposalId] ?? {}, proposalsValidation[selectedUserProposalId] ?? {}],
    [proposalState, proposalsValidation, selectedUserProposalId],
  )

  // action buttons stuff for disabling
  const isProposalSubmitted = selectedUserProposalId >= 0
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  const isBytesValid = useMemo(
    () =>
      currentProposalValidation.bytesValidation?.every(({ validBytes, validTitle, byteId }) => {
        const isSavedBytes = currentOriginalProposal?.proposalData?.find(({ id }) => id === byteId)
        return isSavedBytes
          ? validBytes !== INPUT_STATUS_ERROR
          : validBytes === INPUT_STATUS_SUCCESS && validTitle === INPUT_STATUS_SUCCESS
      }) ?? true,
    [currentProposalValidation.bytesValidation],
  )

  const isPaymentsValid = useMemo(
    () =>
      currentProposalValidation.paymentsValidation?.every(
        ({ to__id, title, token_amount }) =>
          to__id === INPUT_STATUS_SUCCESS || (title === INPUT_STATUS_SUCCESS && token_amount === INPUT_STATUS_SUCCESS),
      ) ?? true,
    [currentProposalValidation.paymentsValidation],
  )

  const isStageOneDataValid = useMemo(
    () =>
      currentProposalValidation.description === INPUT_STATUS_SUCCESS &&
      currentProposalValidation.title === INPUT_STATUS_SUCCESS &&
      currentProposalValidation.sourceCode === INPUT_STATUS_SUCCESS,
    [currentProposalValidation.description, currentProposalValidation.title, currentProposalValidation.sourceCode],
  )

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      <MultyProposals switchItems={usersProposalsToSwitch} switchProposal={changeActiveProposal} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />

      <ProposalSubmissionForm>
        {activeTab === 1 && (
          <StageOneForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
            setProposalHasChange={setProposalHasChange}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            paymentMethods={paymentMethods}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
            setProposalHasChange={setProposalHasChange}
          />
        )}

        <FormButtonContainer>
          <Button
            icon="close-stroke"
            className="close delete-pair"
            text="Drop Proposal"
            kind={ACTION_SECONDARY}
            disabled={!isProposalSubmitted || !isProposalPeriod}
            onClick={() => handleDropProposal(selectedUserProposalId)}
          />
          <Button
            icon="lock"
            className="lock"
            text={'Lock Proposal'}
            disabled={!isProposalSubmitted || !isProposalPeriod || currentProposal.locked || proposalHasChange}
            onClick={() => handleLockProposal(selectedUserProposalId)}
            kind={ACTION_SECONDARY}
          />
          {isProposalSubmitted ? (
            <Button
              icon="bytes"
              className="bytes"
              text="Save Changes"
              kind={ACTION_PRIMARY}
              disabled={!proposalHasChange || currentProposal.locked || !isBytesValid || !isPaymentsValid}
              onClick={() => handleUpdateData(selectedUserProposalId)}
            />
          ) : (
            <Button
              icon="auction"
              kind={ACTION_PRIMARY}
              text={'Submit Proposal'}
              disabled={!isStageOneDataValid || !isBytesValid || !isPaymentsValid}
              onClick={handleSubmitProposal}
            />
          )}
        </FormButtonContainer>
      </ProposalSubmissionForm>
    </Page>
  )
}
