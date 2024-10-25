from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.mvn_faucet.tezos_parameters.request_fake_usdt import RequestFakeUsdtParameter
from maven.types.mvn_faucet.tezos_storage import MvnFaucetStorage
import maven.models as models

async def request_fake_usdt(
    ctx: HandlerContext,
    request_fake_usdt: TzktTransaction[RequestFakeUsdtParameter, MvnFaucetStorage],
) -> None:

    try:
        # Get operation values
        timestamp           = request_fake_usdt.data.timestamp
        level               = int(request_fake_usdt.data.level)
        mvn_faucet_address  = request_fake_usdt.data.target_address
        requester_address   = request_fake_usdt.data.sender_address
    
        # Create request record
        mvn_faucet          = await models.MVNFaucet.get(
            network = ctx.datasource.name.replace('mvkt_',''),
            address = mvn_faucet_address
        )
        user                = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), 
            address = requester_address
        )
        requester           = models.MVNFaucetRequester(
            mvn_faucet      = mvn_faucet,
            request_type    = models.FaucetRequestType.FAKE_USDT,
            user            = user,
            timestamp       = timestamp,
            level           = level
        )
        await requester.save()

    except BaseException as e:
        await save_error_report(e)
