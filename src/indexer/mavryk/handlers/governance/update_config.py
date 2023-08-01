from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_parameters.update_config import UpdateConfigParameter
from mavryk.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address      = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Governance.filter(
            network = ctx.datasource.network,
            address = governance_address
        ).update(
            last_updated_at                     = timestamp,
            success_reward                      = update_config.storage.config.successReward,
            cycle_voters_reward                 = update_config.storage.config.cycleVotersReward,
            proposal_round_vote_percentage      = update_config.storage.config.minProposalRoundVotePercentage,
            min_quorum_percentage               = update_config.storage.config.minQuorumPercentage,
            min_yay_vote_percentage             = update_config.storage.config.minYayVotePercentage,
            proposal_submission_fee_mutez       = update_config.storage.config.proposalSubmissionFeeMutez,
            max_proposal_per_satellite          = update_config.storage.config.maxProposalsPerSatellite,
            blocks_per_proposal_round           = update_config.storage.config.blocksPerProposalRound,
            blocks_per_voting_round             = update_config.storage.config.blocksPerVotingRound,
            blocks_per_timelock_round           = update_config.storage.config.blocksPerTimelockRound,
            proposal_metadata_title_max_length  = update_config.storage.config.proposalDataTitleMaxLength,
            proposal_title_max_length           = update_config.storage.config.proposalTitleMaxLength,
            proposal_description_max_length     = update_config.storage.config.proposalDescriptionMaxLength,
            proposal_invoice_max_length         = update_config.storage.config.proposalInvoiceMaxLength,
            proposal_source_code_max_length     = update_config.storage.config.proposalSourceCodeMaxLength
            
        )
    
    except BaseException as e:
        await save_error_report(e)

