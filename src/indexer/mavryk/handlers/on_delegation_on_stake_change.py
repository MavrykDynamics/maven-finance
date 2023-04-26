from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.delegation.parameter.on_stake_change import OnStakeChangeParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_on_stake_change(
    ctx: HandlerContext,
    on_stake_change: Transaction[OnStakeChangeParameter, DelegationStorage],
) -> None:

    try:
        # Get operation info
        delegation_address      = on_stake_change.data.target_address
        user_address            = on_stake_change.parameter.__root__
    
        # Get and update records
        if user_address in on_stake_change.storage.satelliteRewardsLedger:
            rewards_record          = on_stake_change.storage.satelliteRewardsLedger[user_address]
            user                    = await models.mavryk_user_cache.get(address=user_address)
            delegation              = await models.Delegation.get(
                address = delegation_address
            )
            satellite_rewards, _    = await models.SatelliteRewards.get_or_create(
                user        = user,
                delegation  = delegation
            )
            satellite_rewards.unpaid                                    = float(rewards_record.unpaid)
            satellite_rewards.paid                                      = float(rewards_record.paid)
            satellite_rewards.participation_rewards_per_share           = float(rewards_record.participationRewardsPerShare)
            satellite_rewards.satellite_accumulated_reward_per_share    = float(rewards_record.satelliteAccumulatedRewardsPerShare)
            await satellite_rewards.save()

    except BaseException:
         await save_error_report()

