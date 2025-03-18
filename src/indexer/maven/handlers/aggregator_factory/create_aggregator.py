from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from dipdup.models.tezos import TezosOrigination
from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.aggregator_factory.tezos_parameters.create_aggregator import CreateAggregatorParameter
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dateutil import parser
from maven import models as models

async def create_aggregator(
    ctx: HandlerContext,
    create_aggregator: TezosTransaction[CreateAggregatorParameter, AggregatorFactoryStorage],
    aggregator_origination: TezosOrigination[AggregatorStorage],
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
        heart_beat_seconds                          = int(aggregator_origination.storage.config.heartbeatSeconds)
        reward_amount_smvn                          = float(aggregator_origination.storage.config.rewardAmountStakedMvn)
        reward_amount_mvrk                          = int(aggregator_origination.storage.config.rewardAmountMvrk)
        update_data_paused                          = aggregator_origination.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_mvrk_paused                 = aggregator_origination.storage.breakGlassConfig.withdrawRewardMvrkIsPaused
        withdraw_reward_smvn_paused                 = aggregator_origination.storage.breakGlassConfig.withdrawRewardStakedMvnIsPaused
        last_completed_data_round                   = int(aggregator_origination.storage.lastCompletedData.round)
        last_completed_data_epoch                   = int(aggregator_origination.storage.lastCompletedData.epoch)
        last_completed_data                         = float(aggregator_origination.storage.lastCompletedData.data)
        last_completed_data_pct_oracle_resp         = int(aggregator_origination.storage.lastCompletedData.percentOracleResponse)
        last_completed_data_last_updated_at         = parser.parse(aggregator_origination.storage.lastCompletedData.lastUpdatedAt)
        oracles                                     = aggregator_origination.storage.oracleLedger
    
        # Check aggregator does not already exists
        aggregator_exists                           = await models.Aggregator.filter(
            network     = 'atlasnet',
            address     = aggregator_address
        ).exists()

        if not aggregator_exists:
            # Create a contract and index it
            aggregator_contract   =  f'{aggregator_address}contract'
            if not aggregator_contract in ctx.config.contracts: 
                await ctx.add_contract(
                    kind="tezos",
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
                network     = 'atlasnet',
                address     = aggregator_factory_address
            )
            governance                  = await models.Governance.get(
                network     = 'atlasnet'
            )
            aggregator                  = models.Aggregator(
                network                                     = 'atlasnet',
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
                reward_amount_smvn                          = reward_amount_smvn,
                reward_amount_mvrk                          = reward_amount_mvrk,
                update_data_paused                          = update_data_paused,
                withdraw_reward_mvrk_paused                 = withdraw_reward_mvrk_paused,
                withdraw_reward_smvn_paused                 = withdraw_reward_smvn_paused,
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
                oracle                  = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
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
