from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.trigger_emergency_control import TriggerEmergencyControlParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dateutil import parser 
import mavryk.models as models

async def trigger_emergency_control(
    ctx: HandlerContext,
    trigger_emergency_control: Transaction[TriggerEmergencyControlParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address           = trigger_emergency_control.data.target_address
        emergency_id                = int(trigger_emergency_control.storage.currentEmergencyGovernanceId)
        emergency_next_id           = int(trigger_emergency_control.storage.nextEmergencyGovernanceId)
        emergency_storage           = trigger_emergency_control.storage.emergencyGovernanceLedger[trigger_emergency_control.storage.currentEmergencyGovernanceId]
        proposer_address            = emergency_storage.proposerAddress
        executed                    = emergency_storage.executed
        title                       = emergency_storage.title
        description                 = emergency_storage.description
        total_smvk_votes            = emergency_storage.totalStakedMvkVotes
        smvk_percentage_required    = float(emergency_storage.stakedMvkPercentageRequired)
        smvk_required_for_trigger   = float(emergency_storage.stakedMvkRequiredForBreakGlass)
        start_timestamp             = emergency_storage.startDateTime
        start_level                 = int(emergency_storage.startLevel)
        execution_datetime          = emergency_storage.executedDateTime
        if execution_datetime:
            execution_datetime  = parser.parse(emergency_storage.executedDateTime)
        execution_level             = emergency_storage.executedLevel
        if execution_level:
            execution_level     = int(emergency_storage.executedLevel)
        expiration_timestamp        = emergency_storage.expirationDateTime
        
        # Create record
        emergency  = await models.EmergencyGovernance.get(
            network = ctx.datasource.network,
            address = emergency_address
        )
        emergency.current_emergency_record_id   = int(emergency_id)
        emergency.next_emergency_record_id      = int(emergency_next_id)
        await emergency.save()
    
        proposer    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=proposer_address)
    
        emergency_record = models.EmergencyGovernanceRecord(
            internal_id                     = emergency_id,
            emergency_governance            = emergency,
            proposer                        = proposer,
            executed                        = executed,
            title                           = title,
            description                     = description,
            total_smvk_votes                = total_smvk_votes,
            smvk_percentage_required        = smvk_percentage_required,
            smvk_required_for_trigger       = smvk_required_for_trigger,
            start_timestamp                 = start_timestamp,
            execution_datetime              = execution_datetime,
            expiration_timestamp            = expiration_timestamp,
            start_level                     = start_level,
            execution_level                 = execution_level
        )
        await emergency_record.save()
        
    except BaseException as e:
        await save_error_report(e)

