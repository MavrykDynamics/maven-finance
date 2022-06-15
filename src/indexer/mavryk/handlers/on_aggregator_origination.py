
from dipdup.models import Origination
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_aggregator_origination(
    ctx: HandlerContext,
    aggregator_origination: Origination[AggregatorStorage],
) -> None:

    breakpoint()

    # Get operation info
    address                                     = aggregator_origination.data.originated_contract_address
    admin                                       = aggregator_origination.storage.admin
    governance_address                          = aggregator_origination.storage.governanceAddress
    deviation_trigger_oracle_address            = aggregator_origination.storage.deviationTriggerInfos.oracleAddress
    deviation_trigger_amount                    = float(aggregator_origination.storage.deviationTriggerInfos.amount)
    deviation_trigger_round_price               = float(aggregator_origination.storage.deviationTriggerInfos.roundPrice)
    maintainer_address                          = aggregator_origination.storage.maintainer
    creation_timestamp                          = aggregator_origination.data.timestamp
    name                                        = aggregator_origination.storage.name
    decimals                                    = int(aggregator_origination.storage.decimals)
    number_blocks_delay                         = int(aggregator_origination.storage.numberBlocksDelay)
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
    last_completed_round_decimals               = int(aggregator_origination.storage.lastCompletedRoundPrice.decimals)
    last_completed_round_price_timestamp        = parser.parse(aggregator_origination.storage.lastCompletedRoundPrice.priceDateTime)
    
    # Get or create governance record
    governance, _                   = await models.Governance.get_or_create(address = governance_address)
    await governance.save();
    maintainer, _                   = await models.MavrykUser.get_or_create(address = maintener_address)
    await maintainer.save()
    deviation_trigger_oracle, _     = await models.MavrykUser.get_or_create(address = deviation_trigger_oracle_address)
    await deviation_trigger_oracle.save()

    # Create record
    aggregator      = models.Aggregator(
        address                                     = address,
        admin                                       = admin,
        governance                                  = governance,
        deviation_trigger_oracle                    = deviation_trigger_oracle,
        deviation_trigger_amount                    = deviation_trigger_amount,
        deviation_trigger_round_price               = deviation_trigger_round_price,
        maintainer                                  = maintainer,
        creation_timestamp                          = creation_timestamp,
        name                                        = name,
        decimals                                    = decimals,
        number_blocks_delay                         = number_blocks_delay,
        deviation_trigger_ban_duration              = deviation_trigger_ban_duration,
        request_rate_deviation_deposit_fee          = request_rate_deviation_deposit_fee,
        per_thousand_deviation_trigger              = per_thousand_deviation_trigger,
        percent_oracle_threshold                    = percent_oracle_threshold,
        deviation_reward_amount_xtz                 = deviation_reward_amount_xtz,
        reward_amount_smvk                          = reward_amount_smvk,
        reward_amount_xtz                           = reward_amount_xtz,
        request_rate_update_paused                  = request_rate_update_paused,
        request_rate_update_deviation_paused        = request_rate_update_deviation_paused,
        set_observation_commit_paused               = set_observation_commit_paused,
        set_observation_reveal_paused               = set_observation_reveal_paused,
        withdraw_reward_xtz_paused                  = withdraw_reward_xtz_paused,
        withdraw_reward_smvk_paused                 = withdraw_reward_smvk_paused,
        round                                       = round_count,
        round_start_timestamp                       = round_start_timestamp,
        switch_block                                = switch_block,
        last_completed_round                        = last_completed_round,
        last_completed_round_price                  = last_completed_round_price,
        last_completed_round_pct_oracle_response    = last_completed_round_pct_oracle_response,
        last_completed_round_decimals               = last_completed_round_decimals,
        last_completed_round_price_timestamp        = last_completed_round_price_timestamp
    )

    await aggregator.save()
