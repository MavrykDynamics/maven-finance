
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.trigger_emergency_control import TriggerEmergencyControlParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dateutil import parser 
import mavryk.models as models

async def on_emergency_governance_trigger_emergency_control(
    ctx: HandlerContext,
    trigger_emergency_control: Transaction[TriggerEmergencyControlParameter, EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyAddress            = trigger_emergency_control.data.target_address
    emergencyRecordKey          = int(trigger_emergency_control.data.diffs[-1]['content']['key'])
    emergencyRecordDiffs        = trigger_emergency_control.data.diffs[-1]['content']['value']
    emergencyTitle              = emergencyRecordDiffs['title']
    emergencyDescription        = emergencyRecordDiffs['description']
    emergencyProposer           = trigger_emergency_control.data.sender_address
    emergencyStatus             = emergencyRecordDiffs['status']
    emergencyExecuted           = emergencyRecordDiffs['executed']
    emergencyDropped            = emergencyRecordDiffs['dropped']
    emergencySMVKPercentage     = emergencyRecordDiffs['stakedMvkPercentageRequired']
    emergencySMVKTrigger        = emergencyRecordDiffs['stakedMvkRequiredForTrigger']
    emergencyStart              = parser.parse(emergencyRecordDiffs['startDateTime'])
    emergencyExecuted           = parser.parse(emergencyRecordDiffs['executedDateTime'])
    emergencyExpiration         = parser.parse(emergencyRecordDiffs['expirationDateTime'])
    emergencyCurrent            = int(trigger_emergency_control.storage.currentEmergencyGovernanceId)
    emergencyNext               = int(trigger_emergency_control.storage.nextEmergencyGovernanceProposalId)
    
    # Create record
    emergency  = await models.EmergencyGovernance.get(
        address = emergencyAddress
    )
    emergency.current_emergency_record_id   = emergencyCurrent
    emergency.next_emergency_record_id      = emergencyNext
    await emergency.save()

    proposer, _ = await models.MavrykUser.get_or_create(
        address = emergencyProposer
    )
    await proposer.save()
    emergencyRecord = models.EmergencyGovernanceRecord(
        id                              = emergencyRecordKey,
        emergency_governance            = emergency,
        proposer                        = proposer,
        status                          = emergencyStatus,
        executed                        = emergencyExecuted,
        dropped                         = emergencyDropped,
        title                           = emergencyTitle,
        description                     = emergencyDescription,
        smvk_percentage_required        = emergencySMVKPercentage,
        smvk_required_for_trigger       = emergencySMVKTrigger,
        start_timestamp                 = emergencyStart,
        executed_timestamp              = emergencyExecuted,
        expiration_timestamp            = emergencyExpiration
    )
    await emergencyRecord.save()
    