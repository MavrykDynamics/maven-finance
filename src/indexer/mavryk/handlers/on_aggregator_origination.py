
from dipdup.models import Origination
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_aggregator_origination(
    ctx: HandlerContext,
    aggregator_origination: Origination[AggregatorStorage],
) -> None:

    # Get operation info
    address                                     = aggregator_origination.data.originated_contract_address
    admin                                       = aggregator_origination.storage.admin
    governance_address                          = aggregator_origination.storage.governanceAddress
    creation_timestamp                          = aggregator_origination.data.timestamp
    name                                        = aggregator_origination.storage.name
    decimals                                    = int(aggregator_origination.storage.config.decimals)
    alpha_pct_per_thousand                      = int(aggregator_origination.storage.config.alphaPercentPerThousand)
    deviation_trigger_ban_duration              = int(aggregator_origination.storage.config.deviationTriggerBanDuration)
    per_thousand_deviation_trigger              = int(aggregator_origination.storage.config.perThousandDeviationTrigger)
    pct_oracle_threshold                       = int(aggregator_origination.storage.config.percentOracleThreshold)
    heart_beat_seconds                          = int(aggregator_origination.storage.config.heartBeatSeconds)
    request_rate_deviation_deposit_fee          = float(aggregator_origination.storage.config.requestRateDeviationDepositFee)
    deviation_reward_amount_xtz                 = int(aggregator_origination.storage.config.deviationRewardAmountXtz)
    deviation_reward_amount_smvk                = int(aggregator_origination.storage.config.deviationRewardStakedMvk)
    reward_amount_smvk                          = float(aggregator_origination.storage.config.rewardAmountStakedMvk)
    reward_amount_xtz                           = int(aggregator_origination.storage.config.rewardAmountXtz)
    update_data_paused                         = aggregator_origination.storage.breakGlassConfig.updateDataIsPaused
    withdraw_reward_xtz_paused                  = aggregator_origination.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                 = aggregator_origination.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
    last_completed_price_round                  = int(aggregator_origination.storage.lastCompletedPrice.round)
    last_completed_epoch                        = int(aggregator_origination.storage.lastCompletedPrice.epoch)
    last_completed_price                        = float(aggregator_origination.storage.lastCompletedPrice.price)
    last_completed_price_pct_oracle_resp        = int(aggregator_origination.storage.lastCompletedPrice.percentOracleResponse)
    last_completed_price_datetime               = parser.parse(aggregator_origination.storage.lastCompletedPrice.priceDateTime)
    oracles                                     = aggregator_origination.storage.oracleAddresses

    # Get or create governance record
    governance, _                   = await models.Governance.get_or_create(address = governance_address)
    await governance.save();

    # Create record
    aggregator      = models.Aggregator(
        address                                     = address,
        admin                                       = admin,
        governance                                  = governance,
        last_updated_at                             = creation_timestamp,
        creation_timestamp                          = creation_timestamp,
        name                                        = name,
        decimals                                    = decimals,
        alpha_pct_per_thousand                      = alpha_pct_per_thousand,
        deviation_trigger_ban_duration              = deviation_trigger_ban_duration,
        per_thousand_deviation_trigger              = per_thousand_deviation_trigger,
        pct_oracle_threshold                        = pct_oracle_threshold,
        heart_beat_seconds                          = heart_beat_seconds,
        request_rate_deviation_deposit_fee          = request_rate_deviation_deposit_fee,
        deviation_reward_amount_smvk                = deviation_reward_amount_smvk,
        deviation_reward_amount_xtz                 = deviation_reward_amount_xtz,
        reward_amount_smvk                          = reward_amount_smvk,
        reward_amount_xtz                           = reward_amount_xtz,
        update_data_paused                          = update_data_paused,
        withdraw_reward_xtz_paused                  = withdraw_reward_xtz_paused,
        withdraw_reward_smvk_paused                 = withdraw_reward_smvk_paused,
        last_completed_price_round                  = last_completed_price_round,
        last_completed_price_epoch                  = last_completed_epoch,
        last_completed_price                        = last_completed_price,
        last_completed_price_pct_oracle_resp        = last_completed_price_pct_oracle_resp,
        last_completed_price_datetime               = last_completed_price_datetime
    )

    await aggregator.save()

    # Add oracles to aggregator
    for oracle_address in oracles:
        oracle_storage_record   = oracles[oracle_address]
        oracle_pk               = oracle_storage_record.oraclePublicKey
        oracle_peer_id          = oracle_storage_record.oraclePeerId

        # Create record
        oracle, _               = await models.MavrykUser.get_or_create(address   = oracle_address)
        await oracle.save()
        aggregator_oracle       = models.AggregatorOracle(
            aggregator  = aggregator,
            oracle      = oracle,
            public_key  = oracle_pk,
            peer_id     = oracle_peer_id
        )
        await aggregator_oracle.save()
