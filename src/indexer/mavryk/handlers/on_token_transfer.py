from dipdup.context import HandlerContext
from dipdup.models import TokenTransferData
from mavryk import models as models


async def on_token_transfer(
    ctx: HandlerContext,
    token_transfer: TokenTransferData,
) -> None:
    ...