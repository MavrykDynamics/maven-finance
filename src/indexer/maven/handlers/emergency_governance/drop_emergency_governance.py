from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.emergency_governance.tezos_parameters.drop_emergency_governance import DropEmergencyGovernanceParameter
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
import maven.models as models

async def drop_emergency_governance(
    ctx: HandlerContext,
    drop_emergency_governance: TzktTransaction[DropEmergencyGovernanceParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address           = drop_emergency_governance.data.target_address
        emergency   = await models.EmergencyGovernance.get(
            network = ctx.datasource.name.replace('mvkt_',''),
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

