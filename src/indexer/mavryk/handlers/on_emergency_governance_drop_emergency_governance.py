from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.drop_emergency_governance import DropEmergencyGovernanceParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
import mavryk.models as models

async def on_emergency_governance_drop_emergency_governance(
    ctx: HandlerContext,
    drop_emergency_governance: Transaction[DropEmergencyGovernanceParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address           = drop_emergency_governance.data.target_address
        emergency   = await models.EmergencyGovernance.get(
            network = ctx.datasource.network,
            address = emergency_address
        )
        emergency_current_id        = int(drop_emergency_governance.storage.currentEmergencyGovernanceId)
        emergency_storage           = drop_emergency_governance.storage.emergencyGovernanceLedger[str(emergency.current_emergency_record_id)]
        dropped                     = emergency_storage.dropped
    
        # Update record
        await models.EmergencyGovernanceRecord.filter(
            internal_id             = emergency.current_emergency_record_id,
            emergency_governance    = emergency
        ).update(
            dropped = dropped
        )
    
        emergency.current_emergency_record_id   = emergency_current_id
        await emergency.save()

    except BaseException as e:
         await save_error_report(e)

