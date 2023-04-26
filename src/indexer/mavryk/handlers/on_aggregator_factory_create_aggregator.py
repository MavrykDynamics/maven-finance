from mavryk.utils.error_reporting import save_error_report

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

    try:
        # Get operation info
        aggregator_address                          = aggregator_origination.data.originated_contract_address
        aggregator_factory_address                  = create_aggregator.data.target_address
        admin                                       = aggregator_origination.storage.admin
        governance_address                          = aggregator_origination.storage.governanceAddress
        creation_timestamp                          = aggregator_origination.data.timestamp
        name                                        = aggregator_origination.storage.name
        decimals                                    = int(aggregator_origination.storage.config.decimals)
        alpha_pct_per_thousand                      = int(aggregator_origination.storage.config.alphaPercentPerThousand)
        pct_oracle_threshold                        = int(aggregator_origination.storage.config.percentOracleThreshold)
        heart_beat_seconds                          = int(aggregator_origination.storage.config.heartBeatSeconds)
        reward_amount_smvk                          = float(aggregator_origination.storage.config.rewardAmountStakedMvk)
        reward_amount_xtz                           = int(aggregator_origination.storage.config.rewardAmountXtz)
        update_data_paused                          = aggregator_origination.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_xtz_paused                  = aggregator_origination.storage.breakGlassConfig.withdrawRewardXtzIsPaused
        withdraw_reward_smvk_paused                 = aggregator_origination.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
        last_completed_data_round                   = int(aggregator_origination.storage.lastCompletedData.round)
        last_completed_data_epoch                   = int(aggregator_origination.storage.lastCompletedData.epoch)
        last_completed_data                         = float(aggregator_origination.storage.lastCompletedData.data)
        last_completed_data_pct_oracle_resp         = int(aggregator_origination.storage.lastCompletedData.percentOracleResponse)
        last_completed_data_last_updated_at         = parser.parse(aggregator_origination.storage.lastCompletedData.lastUpdatedAt)
        oracles                                     = aggregator_origination.storage.oracleLedger
    
        # Check aggregator does not already exists
        aggregator_exists                     = await models.Aggregator.get_or_none(
            address     = aggregator_address
        )
    
        if not aggregator_exists:
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
                factory             = aggregator_factory,
                address             = aggregator_address
            )
            if existing_aggregator:
                existing_aggregator.factory  = None
                await existing_aggregator.save()
            aggregator, _               = await models.Aggregator.get_or_create(
                address     = aggregator_address
            )
            aggregator.governance                                   = governance
            aggregator.admin                                        = admin
            aggregator.factory                                      = aggregator_factory
            aggregator.creation_timestamp                           = creation_timestamp
            aggregator.name                                         = name
            aggregator.decimals                                     = decimals
            aggregator.alpha_pct_per_thousand                       = alpha_pct_per_thousand
            aggregator.pct_oracle_threshold                         = pct_oracle_threshold
            aggregator.heart_beat_seconds                           = heart_beat_seconds
            aggregator.reward_amount_smvk                           = reward_amount_smvk
            aggregator.reward_amount_xtz                            = reward_amount_xtz
            aggregator.update_data_paused                           = update_data_paused
            aggregator.withdraw_reward_xtz_paused                   = withdraw_reward_xtz_paused
            aggregator.withdraw_reward_smvk_paused                  = withdraw_reward_smvk_paused
            aggregator.last_completed_data_round                    = last_completed_data_round
            aggregator.last_completed_data_epoch                    = last_completed_data_epoch
            aggregator.last_completed_data                          = last_completed_data
            aggregator.last_completed_data_pct_oracle_resp          = last_completed_data_pct_oracle_resp
            aggregator.last_completed_data_last_updated_at          = last_completed_data_last_updated_at
            await aggregator.save()
    
            # Add oracles to aggregator
            for oracle_address in oracles:
                oracle_storage_record   = oracles[oracle_address]
                oracle_pk               = oracle_storage_record.oraclePublicKey
                oracle_peer_id          = oracle_storage_record.oraclePeerId
    
                # Create record
                oracle                  = await models.mavryk_user_cache.get(address=oracle_address)
                aggregator_oracle       = models.AggregatorOracle(
                    aggregator  = aggregator,
                    user        = oracle,
                    public_key  = oracle_pk,
                    peer_id     = oracle_peer_id,
                    init_round  = last_completed_data_round,
                    init_epoch  = last_completed_data_epoch
                )
                await aggregator_oracle.save()

    except BaseException:
         await save_error_report()

