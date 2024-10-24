from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.types.delegation.tezos_parameters.on_stake_change import OnStakeChangeParameter
from dipdup.context import HandlerContext
from maven.types.delegation.tezos_storage import DelegationStorage
import maven.models as models

async def on_stake_change(
    ctx: HandlerContext,
    on_stake_change: TezosTransaction[OnStakeChangeParameter, DelegationStorage],
) -> None:

    try:
        # Get operation info
        delegation_address      = on_stake_change.data.target_address
        user_records            = on_stake_change.parameter.root
        satellite_ledger        = on_stake_change.storage.satelliteLedger
        delegation              = await models.Delegation.get(
            network = 'atlasnet',
            address = delegation_address
        )

        for user_record in user_records:
            # Parse parameter
            user_address    = user_record.address

            # Get and update records
            if user_address in on_stake_change.storage.satelliteRewardsLedger:
                rewards_record          = on_stake_change.storage.satelliteRewardsLedger[user_address]
                user                    = await models.maven_user_cache.get(network='atlasnet', address=user_address)
                satellite_rewards, _    = await models.SatelliteRewards.get_or_create(
                    user        = user,
                    delegation  = delegation
                )
                satellite_rewards.unpaid                                    = float(rewards_record.unpaid)
                satellite_rewards.paid                                      = float(rewards_record.paid)
                satellite_rewards.participation_rewards_per_share           = float(rewards_record.participationRewardsPerShare)
                satellite_rewards.satellite_accumulated_reward_per_share    = float(rewards_record.satelliteAccumulatedRewardsPerShare)
                satellite_rewards.reference_governance_cycle_id             = int(rewards_record.referenceGovernanceCycleId)
                satellite_rewards.tracked                                   = rewards_record.tracked
                await satellite_rewards.save()

        # Update satellites total delegated amount
        for satellite_address in satellite_ledger:
            satellite_storage                       = satellite_ledger[satellite_address]
            satellite                               = await models.maven_user_cache.get(network='atlasnet', address=satellite_address)
            satellite_record                        = await models.Satellite.get(
                user        = satellite,
                delegation  = delegation
            )
            satellite_record.total_delegated_amount = float(satellite_storage.totalDelegatedAmount)
            await satellite_record.save()

    except BaseException as e:
        await save_error_report(e)

