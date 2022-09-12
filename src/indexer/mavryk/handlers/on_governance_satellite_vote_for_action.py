
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
    satellite_oracle_ledger         = vote_for_action.storage.satelliteOracleLedger
    aggregator_ledger               = vote_for_action.storage.aggregatorLedger

    # Create or update vote record
    governance              = await models.Governance.get(address   = governance_address)
    governance_satellite    = await models.GovernanceSatellite.get(address  = governance_satellite_address)
    action_record           = await models.GovernanceSatelliteAction.get(
        governance_satellite    = governance_satellite,
        id                      = action_id
    )
    action_record.yay_vote_smvk_total   = yay_vote_smvk_total
    action_record.nay_vote_smvk_total   = nay_vote_smvk_total
    action_record.pass_vote_smvk_total  = pass_vote_smvk_total
    action_record.executed              = executed
    if executed:
        action_record.execution_datetime    = timestamp
    await action_record.save()

    voter, _                = await models.MavrykUser.get_or_create(address = voter_address)
    await voter.save()

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
    for aggregator_address in aggregator_ledger:
        aggregator_storage      = aggregator_ledger[aggregator_address]
        oracles                 = aggregator_storage.oracles
        status                  = aggregator_storage.status
        active                  = False
        if status == "ACTIVE":
            active  = True

        aggregator, _           = await models.Aggregator.get_or_create(address = aggregator_address)
        await aggregator.save()

        satellite_aggregator, _ = await models.GovernanceSatelliteAggregator.get_or_create(
            governance_satellite    = governance_satellite,
            aggregator              = aggregator
        )
        satellite_aggregator.active = active
        await satellite_aggregator.save()

        for oracle_address in oracles:
            oracle, _               = await models.MavrykUser.get_or_create(address = oracle_address)
            await oracle.save()
            aggregator_oracle, _    = await models.GovernanceSatelliteAggregatorOracle.get_or_create(
                governance_satellite_aggregator = satellite_aggregator,
                oracle                          = oracle
            )
            await aggregator_oracle.save()

    for oracle_address in satellite_oracle_ledger:
        oracle, _               = await models.MavrykUser.get_or_create(address = oracle_address)
        await oracle.save()
        satellite_oracle_storage    = satellite_oracle_ledger[oracle_address]
        aggregators_subscribed      = int(satellite_oracle_storage.aggregatorsSubscribed)
        aggregator_pairs            = satellite_oracle_storage.aggregatorPairs
        satellite_oracle_record, _  = await models.GovernanceSatelliteSatelliteOracle.get_or_create(
            governance_satellite    = governance_satellite,
            oracle                  = oracle
        )
        satellite_oracle_record.aggregators_subscribed  = aggregators_subscribed
        await satellite_oracle_record.save()

        aggregator_pairs_records    = await models.GovernanceSatelliteSatelliteOracleAggregatorPair.filter(
            governance_satellite_satellite_oracle   = satellite_oracle_record,
            oracle=oracle
        ).all()

        # Remove unexisting entries
        for aggregator_pairs_record in aggregator_pairs_records:
            aggregator_pairs_record_aggregator          = await aggregator_pairs_record.aggregator
            aggregator_pairs_record_aggregator_address  = aggregator_pairs_record_aggregator.address
            if not aggregator_pairs_record_aggregator_address in aggregator_pairs:
                await aggregator_pairs_record.delete()

        # Create entries
        for aggregator_pair_address in aggregator_pairs:
            aggregator_from_pair, _         = await models.Aggregator.get_or_create(address = aggregator_pair_address)
            await aggregator_from_pair.save()

            aggregator_pair_storage         = aggregator_pairs[aggregator_pair_address]
            start_timestamp                 = parser.parse(aggregator_pair_storage.startDateTime)
            token_0_symbol                  = aggregator_pair_storage.aggregatorPair.string_0
            token_1_symbol                  = aggregator_pair_storage.aggregatorPair.string_1

            aggregator_pair_record          = models.GovernanceSatelliteSatelliteOracleAggregatorPair(
                governance_satellite_satellite_oracle           = satellite_oracle_record,
                oracle                                          = oracle,
                aggregator                                      = aggregator_from_pair,
                start_timestamp                                 = start_timestamp,
                token_0_symbol                                  = token_0_symbol,
                token_1_symbol                                  = token_1_symbol
            )
            await aggregator_pair_record.save()