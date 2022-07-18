
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.parameter.register_aggregator import RegisterAggregatorParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_satellite_register_aggregator(
    ctx: HandlerContext,
    register_aggregator: Transaction[RegisterAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    governance_satellite_address    = register_aggregator.data.target_address
    aggregator_address              = register_aggregator.parameter.aggregatorAddress
    aggregator_pair                 = register_aggregator.parameter.aggregatorPair
    aggregator_storage              = register_aggregator.storage.aggregatorLedger[aggregator_address]
    aggregator_status               = aggregator_storage.status
    active                          = False
    if aggregator_status == "ACTIVE":
        active  = True
    timestamp                       = register_aggregator.data.timestamp
    token_0                         = aggregator_pair.string_0
    token_1                         = aggregator_pair.string_1

    # Create or update record
    governance_satellite            = await models.GovernanceSatellite.get(address  = governance_satellite_address)
    aggregator, _                   = await models.Aggregator.get_or_create(address = aggregator_address)
    await aggregator.save()
    aggregator_record, _            = await models.GovernanceSatelliteAggregatorRecord.get_or_create(
        governance_satellite    = governance_satellite,
        aggregator              = aggregator
    )
    aggregator_record.creation_timestamp    = timestamp
    aggregator_record.token_0_symbol        = token_0
    aggregator_record.token_1_symbol        = token_1
    aggregator_record.active                = active
    await aggregator_record.save()
