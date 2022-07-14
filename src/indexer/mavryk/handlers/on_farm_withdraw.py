
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.withdraw import WithdrawParameter
import mavryk.models as models

async def on_farm_withdraw(
    ctx: HandlerContext,
    withdraw: Transaction[WithdrawParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address                    = withdraw.data.target_address
    depositor_address               = withdraw.data.sender_address
    depositor_storage               = withdraw.storage.depositorLedger[depositor_address]
    balance                         = int(depositor_storage.balance)
    participation_rewards_per_share      = float(depositor_storage.participationRewardsPerShare )
    claimed_rewards                 = float(depositor_storage.claimedRewards)
    unclaimed_rewards               = float(depositor_storage.unclaimedRewards)
    lp_token_balance                = int(withdraw.storage.config.lpToken.tokenBalance)
    last_block_update               = int(withdraw.storage.lastBlockUpdate)
    open                            = withdraw.storage.open
    accumulated_rewards_per_share   = float(withdraw.storage.accumulatedRewardsPerShare)
    unpaid_rewards                  = float(withdraw.storage.claimedRewards.unpaid)
    paid_rewards                    = float(withdraw.storage.claimedRewards.paid)

    # Create and update records
    farm                            = await models.Farm.get(
        address = farm_address
    )
    farm.lp_token_balance           = lp_token_balance
    farm.accumulated_mvk_per_share  = accumulated_rewards_per_share
    farm.last_block_update          = last_block_update
    farm.open                       = open
    farm.unpaid_rewards             = unpaid_rewards
    farm.paid_rewards               = paid_rewards
    await farm.save()

    user, _                         = await models.MavrykUser.get_or_create(
        address = depositor_address
    )
    await user.save()

    farm_account, _                 = await models.FarmAccount.get_or_create(
        user = user,
        farm = farm
    )
    farm_account.deposited_amount               = balance
    farm_account.participation_rewards_per_share     = participation_rewards_per_share 
    farm_account.unclaimed_rewards              = unclaimed_rewards
    farm_account.claimed_rewards                = claimed_rewards
    await farm_account.save()
