
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.drop_emergency_governance import DropEmergencyGovernanceParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
import mavryk.models as models

async def on_emergency_governance_drop_emergency_governance(
    ctx: HandlerContext,
    drop_emergency_governance: Transaction[DropEmergencyGovernanceParameter, EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyAddress            = drop_emergency_governance.data.target_address
    emergencyCurrentID          = int(drop_emergency_governance.storage.currentEmergencyGovernanceId)
    emergencyRecordID           = int(drop_emergency_governance.data.diffs[-1]['content']['key'])

    # Update record
    emergency   = await models.EmergencyGovernance.get(
        address = emergencyAddress
    )
    emergency.current_emergency_record_id   = emergencyCurrentID
    await emergency.save()

    emergencyRecord = await models.EmergencyGovernanceRecord.get(
        id  = emergencyRecordID
    )
    emergencyRecord.dropped = True
    await emergencyRecord.save()
