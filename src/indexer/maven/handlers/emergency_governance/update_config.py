from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.emergency_governance.tezos_parameters.update_config import UpdateConfigParameter
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TezosTransaction[UpdateConfigParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.EmergencyGovernance.filter(
            network = 'atlasnet',
            address = emergency_address
        ).update(
            last_updated_at                 = timestamp,
            decimals                        = update_config.storage.config.decimals,
            min_smvn_required_to_trigger    = update_config.storage.config.minStakedMvnRequiredToTrigger,
            min_smvn_required_to_vote       = update_config.storage.config.minStakedMvnRequiredToVote,
            proposal_desc_max_length        = update_config.storage.config.proposalDescMaxLength,
            proposal_title_max_length       = update_config.storage.config.proposalTitleMaxLength,
            required_fee_mumav              = update_config.storage.config.requiredFeeMumav,
            smvn_percentage_required        = update_config.storage.config.stakedMvnPercentageRequired,
            duration_in_minutes             = update_config.storage.config.durationInMinutes
        )

    except BaseException as e:
        await save_error_report(e)

