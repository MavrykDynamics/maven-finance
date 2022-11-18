import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { MultyProposalItem, MultyProposals } from './MultyProposals/MultyProposals.controller'
import { ProposalSubmissionForm } from './ProposalSubmission.style'
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

export const ProposalSubmission = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposals,
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
            title: isValidLength(proposal.title, 1, proposalTitleMaxLength) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
            description: isValidLength(proposal.description, 1, proposalDescriptionMaxLength)
              ? INPUT_STATUS_SUCCESS
              : INPUT_STATUS_ERROR,
            sourceCode: proposal.successReward >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
            ipfs: INPUT_STATUS_SUCCESS,
            successMVKReward: INPUT_STATUS_SUCCESS,
            invoiceTable: INPUT_STATUS_SUCCESS,
            bytesValidation: proposal.proposalData.map((bytesPair) => ({
              validBytes: INPUT_STATUS_SUCCESS,
              validTitle: INPUT_STATUS_SUCCESS,
              byteId: bytesPair.id,
            })),
            paymentsValidation: proposal.proposalPayments.map((payment) => ({
              token_amount: INPUT_STATUS_SUCCESS,
              title: INPUT_STATUS_SUCCESS,
              to__id: INPUT_STATUS_SUCCESS,
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

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      <MultyProposals switchItems={usersProposalsToSwitch} switchProposal={changeActiveProposal} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />

      <ProposalSubmissionForm>
        {activeTab === 1 && (
          <StageOneForm
            proposalId={selectedUserProposalId}
            proposalHasChange={proposalHasChange}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
            handleLockProposal={handleLockProposal}
            handleUpdateData={handleUpdateData}
            handleSubmitProposal={handleSubmitProposal}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            proposalHasChange={proposalHasChange}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
            handleLockProposal={handleLockProposal}
            handleUpdateData={handleUpdateData}
            setProposalHasChange={setProposalHasChange}
            handleSubmitProposal={handleSubmitProposal}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            proposalId={selectedUserProposalId}
            currentProposal={currentProposal}
            proposalHasChange={proposalHasChange}
            paymentMethods={paymentMethods}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
            handleDropProposal={handleDropProposal}
            handleLockProposal={handleLockProposal}
            handleUpdateData={handleUpdateData}
            setProposalHasChange={setProposalHasChange}
            handleSubmitProposal={handleSubmitProposal}
          />
        )}
      </ProposalSubmissionForm>
    </Page>
  )
}
