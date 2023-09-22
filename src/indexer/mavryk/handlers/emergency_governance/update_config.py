from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.emergency_governance.tezos_parameters.update_config import UpdateConfigParameter
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.EmergencyGovernance.filter(
            network = ctx.datasource.network,
            address = emergency_address
        ).update(
            last_updated_at                 = timestamp,
            decimals                        = update_config.storage.config.decimals,
            min_smvk_required_to_trigger    = update_config.storage.config.minStakedMvkRequiredToTrigger,
            min_smvk_required_to_vote       = update_config.storage.config.minStakedMvkRequiredToVote,
            proposal_desc_max_length        = update_config.storage.config.proposalDescMaxLength,
            proposal_title_max_length       = update_config.storage.config.proposalTitleMaxLength,
            required_fee_mutez              = update_config.storage.config.requiredFeeMutez,
            smvk_percentage_required        = update_config.storage.config.stakedMvkPercentageRequired,
            duration_in_minutes             = update_config.storage.config.durationInMinutes
        )

    except BaseException as e:
        await save_error_report(e)

