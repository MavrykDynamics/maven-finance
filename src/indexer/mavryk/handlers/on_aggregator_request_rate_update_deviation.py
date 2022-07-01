
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.request_rate_update_deviation import RequestRateUpdateDeviationParameter
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_aggregator_request_rate_update_deviation(
    ctx: HandlerContext,
    request_rate_update_deviation: Transaction[RequestRateUpdateDeviationParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address  = request_rate_update_deviation.data.target_address
    oracle_address      = request_rate_update_deviation.data.sender_address
    switch_block        = int(request_rate_update_deviation.storage.switchBlock)
    round_count         = int(request_rate_update_deviation.storage.round)
    round_start         = parser.parse(request_rate_update_deviation.storage.roundStart)
    sign                = request_rate_update_deviation.parameter.sign
    round_price         = float(request_rate_update_deviation.storage.deviationTriggerInfos.roundPrice)

    # Create, update and delete records
    oracle, _                                   = await models.MavrykUser.get_or_create(address = oracle_address)
    await oracle.save()

    aggregator                                  = await models.Aggregator.get(address   = aggregator_address)
    aggregator.round                            = round_count
    aggregator.round_start_timestamp            = round_start
    aggregator.switch_block                     = switch_block
    aggregator.deviation_trigger_oracle         = oracle
    aggregator.deviation_trigger_round_price    = round_price
    await aggregator.save()

    await models.AggregatorObservationCommit.filter(aggregator  = aggregator).all().delete()
    await models.AggregatorObservationReveal.filter(aggregator  = aggregator).all().delete()

    observation_commit, _       = await models.AggregatorObservationCommit.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    observation_commit.commit   = sign
    await observation_commit.save()
