from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from maven.types.aggregator.tezos_storage import AggregatorStorage
from maven.types.aggregator.tezos_parameters.update_data import UpdateDataParameter
from dipdup.models.tezos import TezosTransaction
from maven import models as models
from dateutil import parser

async def update_data(
    ctx: HandlerContext,
    update_data: TezosTransaction[UpdateDataParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address              = update_data.data.target_address
        oracle_address                  = update_data.data.sender_address
        oracle_ledger                   = update_data.storage.oracleLedger
        timestamp                       = update_data.data.timestamp
        last_completed_data             = update_data.storage.lastCompletedData
        aggregator                      = await models.Aggregator.get(
            network = 'atlasnet',
            address = aggregator_address
        )
        
        # Update data
        if oracle_address in oracle_ledger:
        
            # Get observations
            oracle_observations             = update_data.parameter.oracleObservations
        
            # Update / create record
            aggregator.last_completed_data_round            = int(last_completed_data.round)
            aggregator.last_completed_data_epoch            = int(last_completed_data.epoch)
            aggregator.last_completed_data                  = float(last_completed_data.data)
            aggregator.last_completed_data_pct_oracle_resp  = int(last_completed_data.percentOracleResponse)
            aggregator.last_completed_data_last_updated_at  = parser.parse(last_completed_data.lastUpdatedAt)
            await aggregator.save()
        
            user                            = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
            oracle                          = await models.AggregatorOracle.get(
                aggregator  = aggregator,
                user        = user
            )
            await oracle.save()
            oracle_reward_mvrk, _            = await models.AggregatorOracleReward.get_or_create(
                oracle      = oracle,
                type        = models.RewardType.MVRK
            )
            if oracle_address in update_data.storage.oracleRewardMvrk:
                oracle_reward_mvrk.reward    = float(update_data.storage.oracleRewardMvrk[oracle_address])
            await oracle_reward_mvrk.save()
            oracle_reward_smvn, _            = await models.AggregatorOracleReward.get_or_create(
                oracle      = oracle,
                type        = models.RewardType.SMVN
            )
            if oracle_address in update_data.storage.oracleRewardStakedMvn:
                oracle_reward_smvn.reward   = float(update_data.storage.oracleRewardStakedMvn[oracle_address])
            await oracle_reward_smvn.save()
        
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
                user                            = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
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

        # Update oracle ledger
        aggregator_oracles  = await models.AggregatorOracle.filter(aggregator   = aggregator).all()
        for aggregator_oracle in aggregator_oracles:
            user            = await aggregator_oracle.user
            user_address    = user.address
            if not user_address in oracle_ledger:
                await aggregator_oracle.delete()

    except BaseException as e:
        await save_error_report(e)

