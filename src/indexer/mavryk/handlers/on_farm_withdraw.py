
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.withdraw import WithdrawParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_withdraw(
    ctx: HandlerContext,
    withdraw: Transaction[WithdrawParameter, FarmStorage],
) -> None:

    # Get operation data
    userWithdrawAmount = int(withdraw.parameter.__root__)
    userParticipation = float(withdraw.data.diffs[-1]['content']['value']['participationMVKPerShare'])
    userAddress = withdraw.data.sender_address
    farmAddress = withdraw.data.target_address
    farmLPBalance = int(withdraw.storage.lpToken.tokenBalance)
    farmAccumulated = float(withdraw.storage.accumulatedMVKPerShare)
    farmLastBlock = int(withdraw.storage.lastBlockUpdate)

    # Update values
    farm = await models.Farm.get(
        address = farmAddress
    )
    farm.lp_balance = farmLPBalance
    farm.accumulated_mvk_per_share = farmAccumulated
    farm.last_block_update = farmLastBlock
    await farm.save()

    user, _ = await models.MavrykUser.get_or_create(
        address = userAddress
    )
    await user.save()

    farmAccount, _ = await models.FarmAccount.get_or_create(
        user = user,
        farm = farm
    )
    farmAccount.deposited_amount -= userWithdrawAmount
    farmAccount.participation_mvk_per_share = userParticipation
    await farmAccount.save()
