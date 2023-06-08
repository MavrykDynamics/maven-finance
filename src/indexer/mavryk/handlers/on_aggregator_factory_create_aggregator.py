from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.utils.contracts import get_contract_metadata
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
        aggregator_exists                           = await models.Aggregator.filter(
            network     = ctx.datasource.network,
            address     = aggregator_address
        ).exists()
    
        if not aggregator_exists:
            # Create a contract and index it
            aggregator_contract   =  f'{aggregator_address}contract'
            if not aggregator_contract in ctx.config.contracts: 
                await ctx.add_contract(
                    name=aggregator_contract,
                    address=aggregator_address,
                    typename="aggregator"
                )
            aggregator_index        =  f'{aggregator_address}index'
            if not aggregator_index in ctx.config.indexes:
                await ctx.add_index(
                    name=aggregator_index,
                    template="aggregator_template",
                    values=dict(
                        aggregator_contract=aggregator_contract
                    )
                )
    
            # Get contract metadata
            contract_metadata = await get_contract_metadata(
                ctx=ctx,
                contract_address=aggregator_address
            )
    
            # Create record
            aggregator_factory          = await models.AggregatorFactory.get(
                network     = ctx.datasource.network,
                address     = aggregator_factory_address
            )
            governance                  = await models.Governance.get(
                network     = ctx.datasource.network
            )
            aggregator                  = models.Aggregator(
                network                                     = ctx.datasource.network,
                address                                     = aggregator_address,
                metadata                                    = contract_metadata,
                governance                                  = governance,
                admin                                       = admin,
                factory                                     = aggregator_factory,
                creation_timestamp                          = creation_timestamp,
                name                                        = name,
                decimals                                    = decimals,
                alpha_pct_per_thousand                      = alpha_pct_per_thousand,
                pct_oracle_threshold                        = pct_oracle_threshold,
                heart_beat_seconds                          = heart_beat_seconds,
                reward_amount_smvk                          = reward_amount_smvk,
                reward_amount_xtz                           = reward_amount_xtz,
                update_data_paused                          = update_data_paused,
                withdraw_reward_xtz_paused                  = withdraw_reward_xtz_paused,
                withdraw_reward_smvk_paused                 = withdraw_reward_smvk_paused,
                last_completed_data_round                   = last_completed_data_round,
                last_completed_data_epoch                   = last_completed_data_epoch,
                last_completed_data                         = last_completed_data,
                last_completed_data_pct_oracle_resp         = last_completed_data_pct_oracle_resp,
                last_completed_data_last_updated_at         = last_completed_data_last_updated_at
            )
            await aggregator.save()
    
            # Add oracles to aggregator
            for oracle_address in oracles:
                oracle_storage_record   = oracles[oracle_address]
                oracle_pk               = oracle_storage_record.oraclePublicKey
                oracle_peer_id          = oracle_storage_record.oraclePeerId
    
                # Create record
                oracle                  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=oracle_address)
                aggregator_oracle       = models.AggregatorOracle(
                    aggregator  = aggregator,
                    user        = oracle,
                    public_key  = oracle_pk,
                    peer_id     = oracle_peer_id,
                    init_round  = last_completed_data_round,
                    init_epoch  = last_completed_data_epoch
                )
                await aggregator_oracle.save()

    except BaseException as e:
         await save_error_report(e)
