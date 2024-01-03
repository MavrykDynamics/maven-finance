from maven.utils.error_reporting import save_error_report

from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.emergency_governance.tezos_parameters.vote_for_emergency_control import VoteForEmergencyControlParameter
from dipdup.context import HandlerContext
from dateutil import parser
import maven.models as models

async def vote_for_emergency_control(
    ctx: HandlerContext,
    vote_for_emergency_control: TzktTransaction[VoteForEmergencyControlParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address           = vote_for_emergency_control.data.target_address
        voter_address               = vote_for_emergency_control.data.sender_address
        voter_storage               = vote_for_emergency_control.storage.emergencyGovernanceVoters

        # Update votes
        for voter_record in voter_storage:
            emergency_id                = voter_record.key.nat
            emergency_storage           = vote_for_emergency_control.storage.emergencyGovernanceLedger[emergency_id]
            total_smvn_votes            = float(emergency_storage.totalStakedMvnVotes)
            smvn_amount                 = float(voter_record.value.nat)
            timestamp                   = parser.parse(voter_record.value.timestamp)
            executed                    = emergency_storage.executed
            execution_datetime          = emergency_storage.executedDateTime
            if execution_datetime:
                execution_datetime  = parser.parse(emergency_storage.executedDateTime)
            execution_level             = emergency_storage.executedLevel 
            if execution_level:
                execution_level     = int(emergency_storage.executedLevel)
        
            # Create and update record
            emergency                   = await models.EmergencyGovernance.get(network=ctx.datasource.name.replace('tzkt_',''), address= emergency_address)
            emergency_record            = await models.EmergencyGovernanceRecord.get(
                emergency_governance        = emergency,
                internal_id                 = int(emergency_id)
            )
            emergency_record.total_smvn_votes      = total_smvn_votes
            emergency_record.executed              = executed
            emergency_record.execution_datetime    = execution_datetime
            emergency_record.execution_level       = execution_level
            await emergency_record.save()
        
            voter                       = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=voter_address)

            emergency_vote_record       = models.EmergencyGovernanceVote(
                timestamp                   = timestamp,
                emergency_governance_record = emergency_record,
                voter                       = voter,
                smvn_amount                 = smvn_amount
            )
            await emergency_vote_record.save()

    except BaseException as e:
        await save_error_report(e)

