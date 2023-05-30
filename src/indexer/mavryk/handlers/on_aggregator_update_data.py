from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.update_data import UpdateDataParameter
from dipdup.models import Transaction
import mavryk.models as models
from dateutil import parser

async def on_aggregator_update_data(
    ctx: HandlerContext,
    update_data: Transaction[UpdateDataParameter, AggregatorStorage],
) -> None:

    try:    
        # Get operation info
        aggregator_address              = update_data.data.target_address
        oracle_address                  = update_data.data.sender_address
        timestamp                       = update_data.data.timestamp
        last_completed_data             = update_data.storage.lastCompletedData
        oracle_reward_xtz_amount        = float(update_data.storage.oracleRewardXtz[oracle_address])
        oracle_reward_smvk_amount       = float(update_data.storage.oracleRewardStakedMvk[oracle_address])
        oracle_observations             = update_data.parameter.oracleObservations
    
        # Update / create record
        aggregator                      = await models.Aggregator.get(
            network = ctx.datasource.network,
            address = aggregator_address
        )
        aggregator.last_completed_data_round            = int(last_completed_data.round)
        aggregator.last_completed_data_epoch            = int(last_completed_data.epoch)
        aggregator.last_completed_data                  = float(last_completed_data.data)
        aggregator.last_completed_data_pct_oracle_resp  = int(last_completed_data.percentOracleResponse)
        aggregator.last_completed_data_last_updated_at  = parser.parse(last_completed_data.lastUpdatedAt)
        await aggregator.save()
    
        user                            = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=oracle_address)
        oracle                          = await models.AggregatorOracle.get(
            aggregator  = aggregator,
            user        = user
        )
        await oracle.save()
        oracle_reward_xtz, _            = await models.AggregatorOracleReward.get_or_create(
            oracle      = oracle,
            type        = models.RewardType.XTZ
        )
        oracle_reward_xtz.reward        = oracle_reward_xtz_amount
        await oracle_reward_xtz.save()
        oracle_reward_smvk, _            = await models.AggregatorOracleReward.get_or_create(
            oracle      = oracle,
            type        = models.RewardType.SMVK
        )
        oracle_reward_smvk.reward       = oracle_reward_smvk_amount
        await oracle_reward_smvk.save()
    
        # Save history data
        aggregator_history_data         = models.AggregatorHistoryData(
            aggregator      = aggregator,
            timestamp       = aggregator.last_completed_data_last_updated_at,
            round           = aggregator.last_completed_data_round,
            epoch           = aggregator.last_completed_data_epoch,
            data            = aggregator.last_completed_data,
            pct_oracle_resp = aggregator.last_completed_data_pct_oracle_resp
        )
        await aggregator_history_data.save()
    
        # Save oracle stats
        for oracle_address in oracle_observations:
            # Get observation data
            oracle_observation              = oracle_observations[oracle_address]
            data                            = float(oracle_observation.data)
            epoch                           = int(oracle_observation.epoch)
            round                           = int(oracle_observation.round)
    
            # Create observation records
            user                            = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=oracle_address)
            oracle                          = await models.AggregatorOracle.get(
                aggregator  = aggregator,
                user        = user
            )
            await oracle.save()
            observation                     = models.AggregatorOracleObservation(
                oracle          = oracle,
                timestamp       = timestamp,
                data            = data,
                epoch           = epoch,
                round           = round
            )
            await observation.save()

    except BaseException as e:
         await save_error_report(e)

