from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance_satellite.tezos_parameters.vote_for_action import VoteForActionParameter, VoteItem as nay, VoteItem1 as pass_, VoteItem2 as yay
from dipdup.context import HandlerContext
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
import maven.models as models
from dateutil import parser

async def vote_for_action(
    ctx: HandlerContext,
    vote_for_action: TzktTransaction[VoteForActionParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        governance_satellite_address    = vote_for_action.data.target_address
        governance_address              = vote_for_action.storage.governanceAddress
        voter_address                   = vote_for_action.data.sender_address
        action_storage                  = vote_for_action.storage.governanceSatelliteActionLedger[vote_for_action.parameter.actionId]
        timestamp                       = vote_for_action.data.timestamp
        yay_vote_smvn_total             = float(action_storage.yayVoteStakedMvnTotal)
        nay_vote_smvn_total             = float(action_storage.nayVoteStakedMvnTotal)
        pass_vote_smvn_total            = float(action_storage.passVoteStakedMvnTotal)
        execution_datetime              = action_storage.executedDateTime
        if execution_datetime:
            execution_datetime          = parser.parse(action_storage.executedDateTime)
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
        governance              = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        governance_satellite    = await models.GovernanceSatellite.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_satellite_address)
        action_record           = await models.GovernanceSatelliteAction.get(
            governance_satellite    = governance_satellite,
            internal_id             = action_id
        )
        action_record.yay_vote_smvn_total   = yay_vote_smvn_total
        action_record.nay_vote_smvn_total   = nay_vote_smvn_total
        action_record.pass_vote_smvn_total  = pass_vote_smvn_total
        action_record.executed              = executed
        if executed:
            action_record.execution_datetime    = execution_datetime
        await action_record.save()
    
        voter                   = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=voter_address)
    
        # Register vote
        satellite_snapshot, _   = await models.GovernanceSatelliteSnapshot.get_or_create(
            governance  = governance,
            user        = voter,
            cycle       = governance.cycle_id
        )
        await satellite_snapshot.save()
        vote_record, _          = await models.GovernanceSatelliteActionVote.get_or_create(
            governance_satellite_action = action_record,
            voter                       = voter,
            satellite_snapshot          = satellite_snapshot
        )
        vote_record.timestamp               = timestamp
        vote_record.vote                    = vote_type
        await vote_record.save()
    
        # Save other personal executions
        for oracle_address in satellite_aggregator_ledger:
            oracle                      = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=oracle_address)
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

                # Aggregators not created by the factory won't be saved
                # TODO: keep?
                aggregator  = await models.Aggregator.get_or_none(network=ctx.datasource.name.replace('tzkt_',''), address= aggregator_address)
                
                if aggregator:
                    start_timestamp                     = parser.parse(aggregators[aggregator_address])
        
                    aggregator_pair_record              = models.GovernanceSatelliteOracleAggregator(
                        governance_satellite_oracle                     = satellite_oracle_record,
                        aggregator                                      = aggregator,
                        start_timestamp                                 = start_timestamp
                    )
                    await aggregator_pair_record.save()

    except BaseException as e:
        await save_error_report(e)

