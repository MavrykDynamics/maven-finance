from mavryk.utils.error_reporting import save_error_report

from mavryk.types.sirius.tezos_storage import SiriusStorage
from dipdup.context import HandlerContext
from mavryk.types.sirius.tezos_parameters.transfer import TransferParameter
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def transfer(
    ctx: HandlerContext,
    transfer: TzktTransaction[TransferParameter, SiriusStorage],
) -> None:

    try:
        # Get operation info
        liquidity_baking_address    = transfer.storage.admin
        sender_address              = transfer.parameter.from_
        receiver_address            = transfer.parameter.to
        sender_balance              = 0
        if sender_address in transfer.storage.tokens:
            sender_balance      = float(transfer.storage.tokens[sender_address])
        receiver_balance            = 0
        if receiver_address in transfer.storage.tokens:
            receiver_balance    = float(transfer.storage.tokens[receiver_address])
    
        # Update record
        liquidity_baking, _         = await models.LiquidityBaking.get_or_create(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = liquidity_baking_address
        )
        await liquidity_baking.save()
    
        sender                  = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=sender_address)
        sender_position, _      = await models.LiquidityBakingPosition.get_or_create(
            liquidity_baking    = liquidity_baking,
            trader              = sender
        )
        sender_position.shares_qty      = sender_balance
        await sender_position.save()
    
        receiver                = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=receiver_address)
        receiver_position, _    = await models.LiquidityBakingPosition.get_or_create(
            liquidity_baking    = liquidity_baking,
            trader              = receiver
        )
        receiver_position.shares_qty    = receiver_balance
        await receiver_position.save()

    except BaseException as e:
        await save_error_report(e)

