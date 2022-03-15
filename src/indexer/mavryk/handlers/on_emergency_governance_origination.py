
from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Origination
import mavryk.models as models

async def on_emergency_governance_origination(
    ctx: HandlerContext,
    emergency_governance_origination: Origination[EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyAddress                    = emergency_governance_origination.data.originated_contract_address
    emergencyRequiredFee                = int(emergency_governance_origination.storage.config.requiredFee)
    emergencySMVKPercentageRequired     = int(emergency_governance_origination.storage.config.stakedMvkPercentageRequired)
    emergencyVoteExpiryDays             = int(emergency_governance_origination.storage.config.voteExpiryDays)
    emergencyMinSMVKRequiredToVote      = int(emergency_governance_origination.storage.config.minStakedMvkRequiredToVote)

    # Create record
    emergencyGovernance = models.EmergencyGovernance(
        address                     = emergencyAddress,
        required_fee                = emergencyRequiredFee,
        smvk_percentage_required    = emergencySMVKPercentageRequired,
        vote_expiry_days            = emergencyVoteExpiryDays,
        min_smvk_required_to_vote   = emergencyMinSMVKRequiredToVote
    )
    await emergencyGovernance.save()
