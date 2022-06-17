
from mavryk.types.aggregator.parameter.request_rate_update import RequestRateUpdateParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from dateutil import parser
import mavryk.models as models

async def on_aggregator_request_rate_update(
    ctx: HandlerContext,
    request_rate_update: Transaction[RequestRateUpdateParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                  = request_rate_update.data.target_address
    deviation_trigger_bans              = request_rate_update.storage.deviationTriggerBan
    deviation_trigger_info              = request_rate_update.storage.deviationTriggerInfos
    deviation_oracle_address            = deviation_trigger_info.oracleAddress
    deviation_amount                    = float(deviation_trigger_info.amount)
    deviation_round_price               = float(deviation_trigger_info.roundPrice)
    switch_block                        = int(request_rate_update.storage.switchBlock)
    round_count                         = int(request_rate_update.storage.round)
    round_start                         = parser.parse(request_rate_update.storage.roundStart)

    # Create, update and delete records
    aggregator                                  = await models.Aggregator.get(address   = aggregator_address)
    deviation_oracle, _                         = await models.MavrykUser.get_or_create(address = deviation_oracle_address)
    await deviation_oracle.save()

    aggregator.round                            = round_count
    aggregator.round_start_timestamp            = round_start
    aggregator.deviation_trigger_oracle         = deviation_oracle
    aggregator.deviation_trigger_round_price    = deviation_round_price
    aggregator.deviation_trigger_amount         = deviation_amount
    aggregator.switch_block                     = switch_block
    await aggregator.save()

    deviation_trigger_ban_records               = await models.AggregatorDeviationTriggerBan.filter(aggregator  = aggregator).all()
    for deviation_trigger_ban_record in deviation_trigger_ban_records:
        oracle                  = await deviation_trigger_ban_record.oracle
        if not oracle.address in deviation_trigger_bans:
            await deviation_trigger_ban_record.delete()
        
    for oracle_address in deviation_trigger_bans:
        oracle, _                   = await models.MavrykUser.get_or_create(address    = oracle_address)
        await oracle.save()

        deviation_trigger_ban, _    = await models.AggregatorDeviationTriggerBan.get_or_create(
            aggregator  = aggregator,
            oracle      = oracle
        )
        deviation_trigger_ban.timestamp = parser.parse(deviation_trigger_bans[oracle_address])
        await deviation_trigger_ban.save()

    await models.AggregatorObservationCommit.filter(aggregator  = aggregator).all().delete()
    await models.AggregatorObservationReveal.filter(aggregator  = aggregator).all().delete()
