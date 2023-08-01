from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.sirius.parameter.transfer import TransferParameter
from mavryk.types.sirius.storage import SiriusStorage


async def _transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, SiriusStorage],
) -> None:
    ...