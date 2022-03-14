
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.vote_for_emergency_control_complete import VoteForEmergencyControlCompleteParameter
from mavryk.types.emergency_governance.parameter.vote_for_emergency_control import VoteForEmergencyControlParameter
from dipdup.context import HandlerContext
from dateutil import parser 
import mavryk.models as models

async def on_emergency_governance_vote_for_emergency_control(
    ctx: HandlerContext,
    vote_for_emergency_control: Transaction[VoteForEmergencyControlParameter, EmergencyGovernanceStorage],
    vote_for_emergency_control_complete: Transaction[VoteForEmergencyControlCompleteParameter, EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyRecordID           = vote_for_emergency_control.parameter.__root__
    emergencyRecordDiffs        = vote_for_emergency_control_complete.storage.emergencyGovernanceLedger[emergencyRecordID]
    emergencyVoter              = vote_for_emergency_control_complete.data.initiator_address
    emergencyVoteTimestamp      = vote_for_emergency_control_complete.data.timestamp
    emergencyVoteSMVKAmount     = int(emergencyRecordDiffs.voters[emergencyVoter].nat)
    emergencyRecordStatus       = emergencyRecordDiffs.status
    emergencyRecordExecuted     = emergencyRecordDiffs.executed
    emergencyRecordExecutedDate = parser.parse(emergencyRecordDiffs.executedDateTime)

    # Create and update record
    voter, _    = await models.MavrykUser.get_or_create(
        address = emergencyVoter
    )
    await voter.save()

    emergencyRecord = await models.EmergencyGovernanceRecord.get(
        id      = emergencyRecordID
    )
    emergencyRecord.status                  = emergencyRecordStatus
    emergencyRecord.executed                = emergencyRecordExecuted
    emergencyRecord.executed_timestamp      = emergencyRecordExecutedDate
    await emergencyRecord.save()

    emergencyVote   = models.EmergencyGovernanceVote(
        timestamp                       = emergencyVoteTimestamp,
        emergency_governance_record     = emergencyRecord,
        voter                           = voter,
        smvk_amount                     = emergencyVoteSMVKAmount
    )
    await emergencyVote.save()
