from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.emergency_governance.tezos_parameters.trigger_emergency_control import TriggerEmergencyControlParameter
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dateutil import parser 
import maven.models as models

async def trigger_emergency_control(
    ctx: HandlerContext,
    trigger_emergency_control: TezosTransaction[TriggerEmergencyControlParameter, EmergencyGovernanceStorage],
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
        total_smvn_votes            = emergency_storage.totalStakedMvnVotes
        smvn_percentage_required    = float(emergency_storage.stakedMvnPercentageRequired)
        smvn_required_for_trigger   = float(emergency_storage.stakedMvnRequiredForBreakGlass)
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
            network = 'atlasnet',
            address = emergency_address
        )
        emergency.current_emergency_record_id   = int(emergency_id)
        emergency.next_emergency_record_id      = int(emergency_next_id)
        await emergency.save()
    
        proposer    = await models.maven_user_cache.get(network='atlasnet', address=proposer_address)
    
        emergency_record = models.EmergencyGovernanceRecord(
            internal_id                     = emergency_id,
            emergency_governance            = emergency,
            proposer                        = proposer,
            executed                        = executed,
            title                           = title,
            description                     = description,
            total_smvn_votes                = total_smvn_votes,
            smvn_percentage_required        = smvn_percentage_required,
            smvn_required_for_trigger       = smvn_required_for_trigger,
            start_timestamp                 = start_timestamp,
            execution_datetime              = execution_datetime,
            expiration_timestamp            = expiration_timestamp,
            start_level                     = start_level,
            execution_level                 = execution_level
        )
        await emergency_record.save()
        
    except BaseException as e:
        await save_error_report(e)

