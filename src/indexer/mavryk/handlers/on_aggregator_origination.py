from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_aggregator_origination(
    ctx: HandlerContext,
    aggregator_origination: Origination[AggregatorStorage],
) -> None:

    try:
        # Get operation info
        address                                     = aggregator_origination.data.originated_contract_address
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
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
    
        # Get or create governance record
        governance, _                   = await models.Governance.get_or_create(address = governance_address)
        await governance.save();
    
        # Check aggregator does not already exists
        aggregator_exists                     = await models.Aggregator.get_or_none(
            address     = address
        )
    
        # Create record
        if not aggregator_exists:
            aggregator      = models.Aggregator(
                address                                     = address,
                admin                                       = admin,
                governance                                  = governance,
                last_updated_at                             = creation_timestamp,
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

