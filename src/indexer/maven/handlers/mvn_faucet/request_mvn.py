from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.mvn_faucet.tezos_parameters.request_mvn import RequestMvnParameter
from maven.types.mvn_faucet.tezos_storage import MvnFaucetStorage
from maven import models as models

async def request_mvn(
    ctx: HandlerContext,
    request_mvn: TezosTransaction[RequestMvnParameter, MvnFaucetStorage],
) -> None:

    try:
        # Get operation values
        timestamp           = request_mvn.data.timestamp
        level               = int(request_mvn.data.level)
        mvn_faucet_address  = request_mvn.data.target_address
        requester_address   = request_mvn.data.sender_address
    
        # Create request record
        mvn_faucet          = await models.MVNFaucet.get(
            network = 'atlasnet',
            address = mvn_faucet_address
        )
        user                = await models.maven_user_cache.get(network='atlasnet', 
            address = requester_address
        )
        requester           = models.MVNFaucetRequester(
            mvn_faucet      = mvn_faucet,
            request_type    = models.FaucetRequestType.MVN,
            user            = user,
            timestamp       = timestamp,
            level           = level
        )
        await requester.save()

    except BaseException as e:
        await save_error_report(e)

