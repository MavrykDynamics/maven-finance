from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.vote_for_action import VoteForActionParameter, VoteItem as nay, VoteItem1 as pass_, VoteItem2 as yay
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
import mavryk.models as models
from dateutil import parser

async def on_governance_satellite_vote_for_action(
    ctx: HandlerContext,
    vote_for_action: Transaction[VoteForActionParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        governance_satellite_address    = vote_for_action.data.target_address
        governance_address              = vote_for_action.storage.governanceAddress
        voter_address                   = vote_for_action.data.sender_address
        action_storage                  = vote_for_action.storage.governanceSatelliteActionLedger[vote_for_action.parameter.actionId]
        timestamp                       = vote_for_action.data.timestamp
        yay_vote_smvk_total             = float(action_storage.yayVoteStakedMvkTotal)
        nay_vote_smvk_total             = float(action_storage.nayVoteStakedMvkTotal)
        pass_vote_smvk_total            = float(action_storage.passVoteStakedMvkTotal)
        executed                        = action_storage.executed
        action_id                       = int(vote_for_action.parameter.actionId)
        vote                            = vote_for_action.parameter.vote
        vote_type                       = models.GovernanceVoteType.YAY
        if type(vote) == nay:
            vote_type   = models.GovernanceVoteType.NAY
        elif type(vote) == pass_:
            vote_type   = models.GovernanceVoteType.PASS
    
        # Votes execution results
        satellite_aggregator_ledger     = vote_for_action.storage.satelliteAggregatorLedger
    
        # Create or update vote record
        governance              = await models.Governance.get(address   = governance_address)
        governance_satellite    = await models.GovernanceSatellite.get(address  = governance_satellite_address)
        action_record                   = await models.GovernanceSatelliteAction.filter(
            governance_satellite    = governance_satellite,
            internal_id             = action_id
        ).first()
        action_record.yay_vote_smvk_total   = yay_vote_smvk_total
        action_record.nay_vote_smvk_total   = nay_vote_smvk_total
        action_record.pass_vote_smvk_total  = pass_vote_smvk_total
        action_record.executed              = executed
        if executed:
            action_record.execution_datetime    = timestamp
        await action_record.save()
    
        voter                   = await models.mavryk_user_cache.get(address=voter_address)
    
        # Register vote
        satellite_snapshot, _   = await models.GovernanceSatelliteSnapshot.get_or_create(
            governance  = governance,
            user        = voter,
            cycle       = governance.cycle_id
        )
        await satellite_snapshot.save()
        vote_record, _          = await models.GovernanceSatelliteActionVote.get_or_create(
            governance_satellite_action = action_record,
            voter                       = voter
        )
        vote_record.timestamp               = timestamp
        vote_record.satellite_snapshot      = satellite_snapshot
        vote_record.vote                    = vote_type
        await vote_record.save()
    
        # Save other personal executions
        for oracle_address in satellite_aggregator_ledger:
            oracle                      = await models.mavryk_user_cache.get(address=oracle_address)
            satellite_oracle_storage    = satellite_aggregator_ledger[oracle_address]
            aggregators                 = satellite_oracle_storage
            satellite_oracle_record, _  = await models.GovernanceSatelliteOracle.get_or_create(
                governance_satellite    = governance_satellite,
                oracle                  = oracle
            )
            await satellite_oracle_record.save()
    
            aggregator_records    = await models.GovernanceSatelliteOracleAggregator.filter(
                governance_satellite_oracle             = satellite_oracle_record,
            ).all()
    
            # Remove unexisting entries
            for aggregator_record in aggregator_records:
                aggregator_record_aggregator            = await aggregator_record.aggregator
                aggregator_record_aggregator_address    = aggregator_record_aggregator.address
                if not aggregator_record_aggregator_address in aggregators:
                    await aggregator_record.delete()
    
            # Create entries
            for aggregator_address in aggregators:
                aggregator, _               = await models.Aggregator.get_or_create(address = aggregator_address)
                await aggregator.save()
    
                start_timestamp                     = parser.parse(aggregators[aggregator_address])
    
                aggregator_pair_record              = models.GovernanceSatelliteOracleAggregator(
                    governance_satellite_oracle                     = satellite_oracle_record,
                    aggregator                                      = aggregator,
                    start_timestamp                                 = start_timestamp,
                )
                await aggregator_pair_record.save()
    except BaseException:
         await save_error_report()

