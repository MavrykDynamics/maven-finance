from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk_faucet.parameter.request_mvk import RequestMvkParameter
from mavryk.types.mvk_faucet.storage import MvkFaucetStorage
import mavryk.models as models

async def on_mvk_faucet_request_mvk(
    ctx: HandlerContext,
    request_mvk: Transaction[RequestMvkParameter, MvkFaucetStorage],
) -> None:

    # Get operation values
    timestamp           = request_mvk.data.timestamp
    level               = int(request_mvk.data.level)
    mvk_faucet_address  = request_mvk.data.target_address
    requester_address   = request_mvk.data.sender_address

    # Create request record
    mvk_faucet          = await models.MVKFaucet.get(
        address = mvk_faucet_address
    )
    user                = await models.mavryk_user_cache.get(
        address = requester_address
    )
    requester           = models.MVKFaucetRequester(
        mvk_faucet  = mvk_faucet,
        user        = user,
        timestamp   = timestamp,
        level       = level
    )
    await requester.save()
