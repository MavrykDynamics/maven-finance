
from mavryk.types.sirius.storage import SiriusStorage
from dipdup.context import HandlerContext
from mavryk.types.sirius.parameter.transfer import TransferParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_sirius_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, SiriusStorage],
) -> None:

    # Get operation info
    liquidity_baking_address    = transfer.storage.admin
    sender_address              = transfer.parameter.from_
    receiver_address            = transfer.parameter.to
    amount                      = float(transfer.parameter.value)

    # Update record
    liquidity_baking, _         = await models.LiquidityBaking.get_or_create(
        address = liquidity_baking_address
    )
    await liquidity_baking.save()

    sender, _               = await models.MavrykUser.get_or_create(
        address = sender_address
    )
    await sender.save()
    sender_position, _      = await models.LiquidityBakingPosition.get_or_create(
        liquidity_baking    = liquidity_baking,
        trader              = sender
    )
    sender_position.shares_qty  -= amount
    await sender_position.save()

    receiver, _             = await models.MavrykUser.get_or_create(
        address = receiver_address
    )
    await receiver.save()
    receiver_position, _    = await models.LiquidityBakingPosition.get_or_create(
        liquidity_baking    = liquidity_baking,
        trader              = receiver
    )
    receiver_position.shares_qty    += amount
    await receiver_position.save()
