from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Origination
import mavryk.models as models

async def on_emergency_governance_origination(
    ctx: HandlerContext,
    emergency_governance_origination: Origination[EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        address                         = emergency_governance_origination.data.originated_contract_address
        admin                           = emergency_governance_origination.storage.admin
        governance_address              = emergency_governance_origination.storage.governanceAddress
        decimals                        = int(emergency_governance_origination.storage.config.decimals)
        required_fee                    = int(emergency_governance_origination.storage.config.requiredFeeMutez)
        min_smvk_required_to_trigger    = float(emergency_governance_origination.storage.config.minStakedMvkRequiredToTrigger)
        min_smvk_required_to_vote       = float(emergency_governance_origination.storage.config.minStakedMvkRequiredToVote)
        proposal_desc_max_length        = int(emergency_governance_origination.storage.config.proposalDescMaxLength)
        proposal_title_max_length       = int(emergency_governance_origination.storage.config.proposalTitleMaxLength)
        smvk_percentage_required        = int(emergency_governance_origination.storage.config.stakedMvkPercentageRequired)
        vote_expiry_days                = int(emergency_governance_origination.storage.config.voteExpiryDays)
        current_emergency_record_id     = int(emergency_governance_origination.storage.currentEmergencyGovernanceId)
        next_emergency_record_id        = int(emergency_governance_origination.storage.nextEmergencyGovernanceId)
        timestamp                       = emergency_governance_origination.data.timestamp
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get or create governance record
        governance, _ = await models.Governance.get_or_create(address=governance_address)
        await governance.save();
    
        # Create record
        emergencyGovernance = models.EmergencyGovernance(
            address                         = address,
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
            vote_expiry_days                = vote_expiry_days,
            current_emergency_record_id     = current_emergency_record_id,
            next_emergency_record_id        = next_emergency_record_id
        )
        await emergencyGovernance.save()

    except BaseException as e:
         await save_error_report(e)

