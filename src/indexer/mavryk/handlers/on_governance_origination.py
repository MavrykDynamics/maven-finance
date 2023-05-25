from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.governance.storage import GovernanceStorage, RoundItem as proposal, RoundItem1 as timelock, RoundItem2 as voting
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_governance_origination(
    ctx: HandlerContext,
    governance_origination: Origination[GovernanceStorage],
) -> None:

    try:
        # Get operation values
        address                                 = governance_origination.data.originated_contract_address
        admin                                   = governance_origination.storage.admin
        governance_proxy_address                = governance_origination.storage.governanceProxyAddress
        success_reward                          = float(governance_origination.storage.config.successReward)
        cycle_voters_reward                     = float(governance_origination.storage.config.cycleVotersReward)
        proposal_round_vote_percentage          = int(governance_origination.storage.config.minProposalRoundVotePercentage)
        proposal_round_vote_required            = int(governance_origination.storage.config.minProposalRoundVotesRequired)
        min_quorum_percentage                   = int(governance_origination.storage.config.minQuorumPercentage)
        min_yay_vote_percentage                 = int(governance_origination.storage.config.minYayVotePercentage)
        proposal_submission_fee                 = int(governance_origination.storage.config.proposalSubmissionFeeMutez)
        max_proposals_per_delegate              = int(governance_origination.storage.config.maxProposalsPerSatellite)
        blocks_per_Proposal_round               = int(governance_origination.storage.config.blocksPerProposalRound)
        blocks_per_voting_round                 = int(governance_origination.storage.config.blocksPerVotingRound)
        blocks_per_timelock_round               = int(governance_origination.storage.config.blocksPerTimelockRound)
        proposal_metadata_title_max_length      = int(governance_origination.storage.config.proposalDataTitleMaxLength)
        proposal_title_max_length               = int(governance_origination.storage.config.proposalTitleMaxLength)
        proposal_description_max_length         = int(governance_origination.storage.config.proposalDescriptionMaxLength)
        proposal_invoice_max_length             = int(governance_origination.storage.config.proposalInvoiceMaxLength)
        proposal_source_code_max_length         = int(governance_origination.storage.config.proposalSourceCodeMaxLength)
        current_round                           = governance_origination.storage.currentCycleInfo.round
        current_blocks_per_proposal_round       = int(governance_origination.storage.currentCycleInfo.blocksPerProposalRound)
        current_blocks_per_voting_round         = int(governance_origination.storage.currentCycleInfo.blocksPerVotingRound)
        current_blocks_per_timelock_round       = int(governance_origination.storage.currentCycleInfo.blocksPerTimelockRound)
        current_round_start_level               = int(governance_origination.storage.currentCycleInfo.roundStartLevel)
        current_round_end_level                 = int(governance_origination.storage.currentCycleInfo.roundEndLevel)
        current_cycle_end_level                 = int(governance_origination.storage.currentCycleInfo.cycleEndLevel)
        current_cycle_total_voters_reward       = int(governance_origination.storage.currentCycleInfo.cycleTotalVotersReward)
        next_proposal_id                        = int(governance_origination.storage.nextProposalId)
        cycle_id                                = int(governance_origination.storage.cycleId)
        cycle_highest_voted_proposal_id         = int(governance_origination.storage.cycleHighestVotedProposalId )
        timelock_proposal_id                    = int(governance_origination.storage.timelockProposalId)
        whitelisted_developers                  = governance_origination.storage.whitelistDevelopers
        timestamp                               = governance_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Current round
        governance_round_type = models.GovernanceRoundType.PROPOSAL
        if type(current_round) == proposal:
            governance_round_type = models.GovernanceRoundType.PROPOSAL
        elif type(current_round) == timelock:
            governance_round_type = models.GovernanceRoundType.TIMELOCK
        elif type(current_round) == voting:
            governance_round_type = models.GovernanceRoundType.VOTING
    
        # Create record
        governance, _  = await models.Governance.get_or_create(
            address = address,
            network = ctx.datasource.network
        )
        governance.metadata                                = contract_metadata
        governance.active                                  = True
        governance.admin                                   = admin
        governance.last_updated_at                         = timestamp
        governance.address                                 = address
        governance.governance_proxy_address                = governance_proxy_address
        governance.success_reward                          = success_reward
        governance.cycle_voters_reward                     = cycle_voters_reward
        governance.proposal_round_vote_percentage          = proposal_round_vote_percentage
        governance.proposal_round_vote_required            = proposal_round_vote_required
        governance.min_quorum_percentage                   = min_quorum_percentage
        governance.min_yay_vote_percentage                 = min_yay_vote_percentage
        governance.proposal_submission_fee_mutez           = proposal_submission_fee
        governance.max_proposal_per_satellite              = max_proposals_per_delegate
        governance.blocks_per_proposal_round               = blocks_per_Proposal_round
        governance.blocks_per_voting_round                 = blocks_per_voting_round
        governance.blocks_per_timelock_round               = blocks_per_timelock_round
        governance.proposal_metadata_title_max_length      = proposal_metadata_title_max_length
        governance.proposal_title_max_length               = proposal_title_max_length
        governance.proposal_description_max_length         = proposal_description_max_length
        governance.proposal_invoice_max_length             = proposal_invoice_max_length
        governance.proposal_source_code_max_length         = proposal_source_code_max_length
        governance.current_round                           = governance_round_type
        governance.current_blocks_per_proposal_round       = current_blocks_per_proposal_round
        governance.current_blocks_per_voting_round         = current_blocks_per_voting_round
        governance.current_blocks_per_timelock_round       = current_blocks_per_timelock_round
        governance.current_round_start_level               = current_round_start_level
        governance.current_round_end_level                 = current_round_end_level
        governance.current_cycle_end_level                 = current_cycle_end_level
        governance.current_cycle_total_voters_reward       = current_cycle_total_voters_reward
        governance.next_proposal_id                        = next_proposal_id
        governance.cycle_id                                = cycle_id
        governance.cycle_highest_voted_proposal_id         = cycle_highest_voted_proposal_id 
        governance.timelock_proposal_id                    = timelock_proposal_id
        await governance.save()
    
        # Add whitelisted developers
        for whitelisted_developer_address in whitelisted_developers:
            user                                    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=whitelisted_developer_address)
            whitelist_developer, _                  = await models.WhitelistDeveloper.get_or_create(
                governance  = governance,
                developer   = user
            )
            await whitelist_developer.save()

    except BaseException as e:
         await save_error_report(e)

