from dipdup.context import HandlerContext
from dipdup.models import TokenTransferData
from dipdup.enums import TokenStandard
from mavryk import models as models
import mavryk.models as models

async def on_treasury_token_transfer_receiver(
    ctx: HandlerContext,
    token_transfer: TokenTransferData,
) -> None:
    
    # Get operation info
    treasury_address    = token_transfer.to_address
    token_address       = token_transfer.contract_address
    token_id            = token_transfer.token_id
    tzkt_token_id       = int(token_transfer.tzkt_token_id)
    standard            = token_transfer.standard
    token_standard      = None
    metadata            = token_transfer.metadata
    amount              = float(token_transfer.amount)

    if standard:
        if standard == TokenStandard.FA12:
            token_standard  = "fa12"
        elif standard == TokenStandard.FA2:
            token_standard  = "fa2"

    # Update records
    treasury            = await models.Treasury.get(
        address         = treasury_address
    )
    treasury_balance, _ = await models.TreasuryBalance.get_or_create(
        treasury        = treasury,
        token_address   = token_address,
        token_id        = token_id
    )
    treasury_balance.token_standard = token_standard
    treasury_balance.tzkt_token_id  = tzkt_token_id
    treasury_balance.metadata       = metadata
    treasury_balance.balance        += amount
    await treasury_balance.save()
