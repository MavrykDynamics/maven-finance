
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_observation_reveal import SetObservationRevealParameter
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_aggregator_set_observation_reveal(
    ctx: HandlerContext,
    set_observation_reveal: Transaction[SetObservationRevealParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                      = set_observation_reveal.data.target_address
    oracle_address                          = set_observation_reveal.data.sender_address
    price                                   = int(set_observation_reveal.parameter.priceSalted.nat)
    switch_block                            = int(set_observation_reveal.storage.switchBlock)
    last_completed_round_price              = set_observation_reveal.storage.lastCompletedRoundPrice
    last_round_count                        = last_completed_round_price.round
    last_price                              = last_completed_round_price.price
    last_percent_oracle_response            = last_completed_round_price.percentOracleResponse
    last_price_timestamp                    = parser.parse(last_completed_round_price.priceDateTime)
    oracle_smvk_reward_storage              = float(set_observation_reveal.storage.oracleRewardStakedMvk[oracle_address])
    oracle_xtz_reward_storage               = float(set_observation_reveal.storage.oracleRewardXtz[oracle_address])

    # Create record
    oracle, _                                           = await models.MavrykUser.get_or_create(address = oracle_address)
    await oracle.save()

    aggregator                                          = await models.Aggregator.get(address   = aggregator_address)
    aggregator.switch_block                             = switch_block
    aggregator.last_completed_round                     = last_round_count
    aggregator.last_completed_round_price               = last_price
    aggregator.last_completed_round_pct_oracle_response = last_percent_oracle_response
    aggregator.last_completed_round_price_timestamp     = last_price_timestamp
    await aggregator.save()

    observation_reveal, _                               = await models.AggregatorObservationReveal.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    observation_reveal.reveal                           = price
    await observation_reveal.save()

    oracle_reward_smvk, _                               = await models.AggregatorOracleRewardSMVK.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    oracle_reward_smvk.smvk                             = oracle_smvk_reward_storage
    await oracle_reward_smvk.save()

    oracle_reward_xtz, _                                = await models.AggregatorOracleRewardXTZ.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    oracle_reward_xtz.xtz                               = oracle_xtz_reward_storage
    await oracle_reward_xtz.save()
