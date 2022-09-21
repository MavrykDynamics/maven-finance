
from dipdup.models import Transaction
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_contract_metadata
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

    # Persist contract metadata
    await persist_contract_metadata(
        ctx=ctx,
        contract_address=aggregator_address
    )

    # Create record
    aggregator_factory          = await models.AggregatorFactory.get(
        address     = aggregator_factory_address
    )
    governance                  = await models.Governance.get(
        address     = governance_address
    )
    existing_aggregator         = await models.Aggregator.get_or_none(
        token_0_symbol      = token_0_symbol,
        token_1_symbol      = token_1_symbol,
        factory             = aggregator_factory
    )
    if existing_aggregator:
        existing_aggregator.factory  = None
        await existing_aggregator.save()
    aggregator, _               = await models.Aggregator.get_or_create(
        address     = aggregator_address
    )
    aggregator.governance                                  = governance
    aggregator.admin                                       = admin
    aggregator.token_0_symbol                              = token_0_symbol
    aggregator.token_1_symbol                              = token_1_symbol
    aggregator.factory                                     = aggregator_factory
    aggregator.creation_timestamp                          = creation_timestamp
    aggregator.name                                        = name
    aggregator.decimals                                    = decimals
    aggregator.alpha_pct_per_thousand                      = alpha_pct_per_thousand
    aggregator.deviation_trigger_ban_duration              = deviation_trigger_ban_duration
    aggregator.per_thousand_deviation_trigger              = per_thousand_deviation_trigger
    aggregator.pct_oracle_threshold                        = pct_oracle_threshold
    aggregator.heart_beat_seconds                          = heart_beat_seconds
    aggregator.request_rate_deviation_deposit_fee          = request_rate_deviation_deposit_fee
    aggregator.deviation_reward_amount_smvk                = deviation_reward_amount_smvk
    aggregator.deviation_reward_amount_xtz                 = deviation_reward_amount_xtz
    aggregator.reward_amount_smvk                          = reward_amount_smvk
    aggregator.reward_amount_xtz                           = reward_amount_xtz
    aggregator.update_data_paused                         = update_data_paused
    aggregator.withdraw_reward_xtz_paused                  = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused                 = withdraw_reward_smvk_paused
    aggregator.last_completed_price_round                  = last_completed_price_round
    aggregator.last_completed_price_epoch                  = last_completed_epoch
    aggregator.last_completed_price                        = last_completed_price
    aggregator.last_completed_price_pct_oracle_resp        = last_completed_price_pct_oracle_resp
    aggregator.last_completed_price_datetime               = last_completed_price_datetime
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
