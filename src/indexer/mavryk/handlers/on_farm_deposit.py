
from mavryk.types.farm.parameter.deposit import DepositParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_deposit(
    ctx: HandlerContext,
    deposit: Transaction[DepositParameter, FarmStorage],
) -> None:
    # Get operation data
    userDepositAmount = int(deposit.parameter.__root__)
    userParticipation = float(deposit.data.diffs[-1]['content']['value']['participationMVKPerShare'])
    userAddress = deposit.data.sender_address
    farmAddress = deposit.data.target_address
    farmLPBalance = int(deposit.storage.lpToken.tokenBalance)
    farmAccumulated = float(deposit.storage.accumulatedMVKPerShare)
    farmLastBlock = int(deposit.storage.lastBlockUpdate)

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
    farmAccount.deposited_amount += userDepositAmount
    farmAccount.participation_mvk_per_share = userParticipation
    await farmAccount.save()
