
from mavryk.types.farm.parameter.deposit import DepositParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_deposit(
    ctx: HandlerContext,
    deposit: Transaction[DepositParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address                    = deposit.data.target_address
    depositor_address               = deposit.data.sender_address
    depositor_storage               = deposit.storage.depositors[depositor_address]
    balance                         = int(depositor_storage.balance)
    participation_mvk_per_share     = float(depositor_storage.participationMVKPerShare)
    claimed_rewards                 = float(depositor_storage.claimedRewards)
    unclaimed_rewards               = float(depositor_storage.unclaimedRewards)
    lp_token_balance                = int(deposit.storage.config.lpToken.tokenBalance)
    last_block_update               = int(deposit.storage.lastBlockUpdate)
    open                            = deposit.storage.open
    accumulated_rewards_per_share   = float(deposit.storage.accumulatedRewardsPerShare)
    unpaid_rewards                  = float(deposit.storage.claimedRewards.unpaid)
    paid_rewards                    = float(deposit.storage.claimedRewards.paid)

    # Create and update records
    farm                            = await models.Farm.get(
        address = farm_address
    )
    farm.lp_balance                 = lp_token_balance
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
    farm_account.participation_mvk_per_share    = participation_mvk_per_share
    farm_account.unclaimed_rewards              = unclaimed_rewards
    farm_account.claimed_rewards                = claimed_rewards
    await farm_account.save()
