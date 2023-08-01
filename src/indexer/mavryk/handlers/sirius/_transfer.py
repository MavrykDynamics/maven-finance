from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.sirius.tezos_parameters.transfer import TransferParameter
from mavryk.types.sirius.tezos_storage import SiriusStorage


async def _transfer(
    ctx: HandlerContext,
    transfer: TzktTransaction[TransferParameter, SiriusStorage],
) -> None:
    ...