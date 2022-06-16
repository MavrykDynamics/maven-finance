
from dipdup.models import Transaction
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.aggregator_factory.parameter.create_aggregator import CreateAggregatorParameter
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator.storage import AggregatorStorage
from dateutil import parser
import mavryk.models as models

async def on_aggregator_factory_create_aggregator(
    ctx: HandlerContext,
    create_aggregator: Transaction[CreateAggregatorParameter, AggregatorFactoryStorage],
    aggregator_origination: Origination[AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                          = aggregator_origination.data.originated_contract_address
    aggregator_factory_address                  = create_aggregator.data.target_address
    token_0_symbol                              = create_aggregator.parameter.string_0
    token_1_symbol                              = create_aggregator.parameter.string_1
    admin                                       = aggregator_origination.storage.admin
    governance_address                          = aggregator_origination.storage.governanceAddress
    deviation_trigger_oracle_address            = aggregator_origination.storage.deviationTriggerInfos.oracleAddress
    deviation_trigger_amount                    = float(aggregator_origination.storage.deviationTriggerInfos.amount)
    deviation_trigger_round_price               = float(aggregator_origination.storage.deviationTriggerInfos.roundPrice)
    maintainer_address                          = aggregator_origination.storage.maintainer
    creation_timestamp                          = aggregator_origination.data.timestamp
    name                                        = aggregator_origination.storage.name
    decimals                                    = int(aggregator_origination.storage.config.decimals)
    number_blocks_delay                         = int(aggregator_origination.storage.config.numberBlocksDelay)
    deviation_trigger_ban_duration              = int(aggregator_origination.storage.config.deviationTriggerBanDuration)
    per_thousand_deviation_trigger              = int(aggregator_origination.storage.config.perThousandDeviationTrigger)
    percent_oracle_threshold                    = int(aggregator_origination.storage.config.percentOracleThreshold)
    request_rate_deviation_deposit_fee          = float(aggregator_origination.storage.config.requestRateDeviationDepositFee)
    deviation_reward_amount_xtz                 = int(aggregator_origination.storage.config.deviationRewardAmountXtz)
    reward_amount_smvk                          = float(aggregator_origination.storage.config.rewardAmountStakedMvk)
    reward_amount_xtz                           = int(aggregator_origination.storage.config.rewardAmountXtz)
    request_rate_update_paused                  = aggregator_origination.storage.breakGlassConfig.requestRateUpdateIsPaused
    request_rate_update_deviation_paused        = aggregator_origination.storage.breakGlassConfig.requestRateUpdateDeviationIsPaused
    set_observation_commit_paused               = aggregator_origination.storage.breakGlassConfig.setObservationCommitIsPaused
    set_observation_reveal_paused               = aggregator_origination.storage.breakGlassConfig.setObservationRevealIsPaused
    withdraw_reward_xtz_paused                  = aggregator_origination.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                 = aggregator_origination.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
    round_count                                 = int(aggregator_origination.storage.round)
    round_start_timestamp                       = parser.parse(aggregator_origination.storage.roundStart)
    switch_block                                = int(aggregator_origination.storage.switchBlock)
    last_completed_round                        = int(aggregator_origination.storage.lastCompletedRoundPrice.round)
    last_completed_round_price                  = float(aggregator_origination.storage.lastCompletedRoundPrice.price)
    last_completed_round_pct_oracle_response    = int(aggregator_origination.storage.lastCompletedRoundPrice.percentOracleResponse)
    last_completed_round_price_timestamp        = parser.parse(aggregator_origination.storage.lastCompletedRoundPrice.priceDateTime)

    # Create a contract and index it
    await ctx.add_contract(
        name=aggregator_address + 'contract',
        address=aggregator_address,
        typename="aggregator"
    )
    await ctx.add_index(
        name=aggregator_address + 'index',
        template="aggregator_template",
        values=dict(
            aggregator_contract=aggregator_address + 'contract'
        )
    )

    # Create record
    aggregator_factory          = await models.AggregatorFactory.get(
        address     = aggregator_factory_address
    )
    deviation_trigger_oracle, _ = await models.MavrykUser.get_or_create(
        address     = deviation_trigger_oracle_address
    )
    await deviation_trigger_oracle.save()
    maintainer, _               = await models.MavrykUser.get_or_create(
        address     = maintainer_address
    )
    await maintainer.save()
    governance                  = await models.Governance.get(
        address     = governance_address
    )
    existing_aggregator         = await models.Aggregator.get_or_none(
        token_0_symbol      = token_0_symbol,
        token_1_symbol      = token_1_symbol,
        aggregator_factory  = aggregator_factory
    )
    if existing_aggregator:
        existing_aggregator.aggregator_factory  = None
        await existing_aggregator.save()
    aggregator, _               = await models.Aggregator.get_or_create(
        address     = aggregator_address
    )
    aggregator.governance                                  = governance
    aggregator.admin                                       = admin
    aggregator.token_0_symbol                              = token_0_symbol
    aggregator.token_1_symbol                              = token_1_symbol
    aggregator.aggregator_factory                          = aggregator_factory
    aggregator.deviation_trigger_oracle                    = deviation_trigger_oracle
    aggregator.maintainer                                  = maintainer
    aggregator.deviation_trigger_amount                    = deviation_trigger_amount
    aggregator.deviation_trigger_round_price               = deviation_trigger_round_price
    aggregator.creation_timestamp                          = creation_timestamp
    aggregator.name                                        = name
    aggregator.decimals                                    = decimals
    aggregator.number_blocks_delay                         = number_blocks_delay
    aggregator.deviation_trigger_ban_duration              = deviation_trigger_ban_duration
    aggregator.request_rate_deviation_deposit_fee          = request_rate_deviation_deposit_fee
    aggregator.per_thousand_deviation_trigger              = per_thousand_deviation_trigger
    aggregator.percent_oracle_threshold                    = percent_oracle_threshold
    aggregator.deviation_reward_amount_xtz                 = deviation_reward_amount_xtz
    aggregator.reward_amount_smvk                          = reward_amount_smvk
    aggregator.reward_amount_xtz                           = reward_amount_xtz
    aggregator.request_rate_update_paused                  = request_rate_update_paused
    aggregator.request_rate_update_deviation_paused        = request_rate_update_deviation_paused
    aggregator.set_observation_commit_paused               = set_observation_commit_paused
    aggregator.set_observation_reveal_paused               = set_observation_reveal_paused
    aggregator.withdraw_reward_xtz_paused                  = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused                 = withdraw_reward_smvk_paused
    aggregator.round                                       = round_count
    aggregator.round_start_timestamp                       = round_start_timestamp
    aggregator.switch_block                                = switch_block
    aggregator.last_completed_round                        = last_completed_round
    aggregator.last_completed_round_price                  = last_completed_round_price
    aggregator.last_completed_round_pct_oracle_response    = last_completed_round_pct_oracle_response
    aggregator.last_completed_round_price_timestamp        = last_completed_round_price_timestamp
    await aggregator.save()
