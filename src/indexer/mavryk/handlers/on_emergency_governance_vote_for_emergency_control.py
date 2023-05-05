from mavryk.utils.error_reporting import save_error_report

from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.vote_for_emergency_control import VoteForEmergencyControlParameter
from dipdup.context import HandlerContext
from dateutil import parser
import mavryk.models as models

async def on_emergency_governance_vote_for_emergency_control(
    ctx: HandlerContext,
    vote_for_emergency_control: Transaction[VoteForEmergencyControlParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address           = vote_for_emergency_control.data.target_address
        voter_address               = vote_for_emergency_control.data.sender_address
        emergency_id                = int(vote_for_emergency_control.storage.nextEmergencyGovernanceId) - 1
        emergency_storage           = vote_for_emergency_control.storage.emergencyGovernanceLedger[str(emergency_id)]
        voter_storage               = emergency_storage.voters[voter_address]
        timestamp                   = vote_for_emergency_control.data.timestamp
        total_smvk_votes            = float(emergency_storage.totalStakedMvkVotes)
        smvk_amount                 = float(voter_storage.nat)
        executed                    = emergency_storage.executed
        execution_datetime          = parser.parse(emergency_storage.executedDateTime)
        execution_level             = int(emergency_storage.executedLevel)
    
        # Create and update record
        emergency                   = await models.EmergencyGovernance.get(address  = emergency_address)
        emergency_record            = await models.EmergencyGovernanceRecord.filter(
            emergency_governance        = emergency,
            internal_id                 = emergency_id
        ).first()
        emergency_record.total_smvk_votes      = total_smvk_votes
        emergency_record.executed              = executed
        emergency_record.execution_datetime    = execution_datetime
        emergency_record.execution_level       = execution_level
        await emergency_record.save()
    
        voter                       = await models.mavryk_user_cache.get(address=voter_address)
    
        emergency_vote_record       = models.EmergencyGovernanceVote(
            timestamp                   = timestamp,
            emergency_governance_record = emergency_record,
            voter                       = voter,
            smvk_amount                 = smvk_amount
        )
        await emergency_vote_record.save()

    except BaseException as e:
         await save_error_report(e)

