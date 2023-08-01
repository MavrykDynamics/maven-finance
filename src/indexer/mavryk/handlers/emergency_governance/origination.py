from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Origination
import mavryk.models as models

async def origination(
    ctx: HandlerContext,
    emergency_governance_origination: Origination[EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        address                         = emergency_governance_origination.data.originated_contract_address
        admin                           = emergency_governance_origination.storage.admin
        decimals                        = int(emergency_governance_origination.storage.config.decimals)
        required_fee                    = int(emergency_governance_origination.storage.config.requiredFeeMutez)
        min_smvk_required_to_trigger    = float(emergency_governance_origination.storage.config.minStakedMvkRequiredToTrigger)
        min_smvk_required_to_vote       = float(emergency_governance_origination.storage.config.minStakedMvkRequiredToVote)
        proposal_desc_max_length        = int(emergency_governance_origination.storage.config.proposalDescMaxLength)
        proposal_title_max_length       = int(emergency_governance_origination.storage.config.proposalTitleMaxLength)
        smvk_percentage_required        = int(emergency_governance_origination.storage.config.stakedMvkPercentageRequired)
        duration_in_minutes             = int(emergency_governance_origination.storage.config.durationInMinutes)
        current_emergency_record_id     = int(emergency_governance_origination.storage.currentEmergencyGovernanceId)
        next_emergency_record_id        = int(emergency_governance_origination.storage.nextEmergencyGovernanceId)
        timestamp                       = emergency_governance_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.network)
    
        # Create record
        emergencyGovernance = models.EmergencyGovernance(
            address                         = address,
            network                         = ctx.datasource.network,
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            decimals                        = decimals,
            min_smvk_required_to_trigger    = min_smvk_required_to_trigger,
            min_smvk_required_to_vote       = min_smvk_required_to_vote,
            proposal_desc_max_length        = proposal_desc_max_length,
            proposal_title_max_length       = proposal_title_max_length,
            required_fee_mutez              = required_fee,
            smvk_percentage_required        = smvk_percentage_required,
            duration_in_minutes             = duration_in_minutes,
            current_emergency_record_id     = current_emergency_record_id,
            next_emergency_record_id        = next_emergency_record_id
        )
        await emergencyGovernance.save()

    except BaseException as e:
        await save_error_report(e)

