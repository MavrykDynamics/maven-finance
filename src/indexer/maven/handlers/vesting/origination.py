from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_contract_metadata
from maven.types.vesting.tezos_storage import VestingStorage
from dipdup.models.tezos import TezosOrigination
from dipdup.context import HandlerContext
from maven import models as models

async def origination(
    ctx: HandlerContext,
    vesting_origination: TezosOrigination[VestingStorage],
) -> None:

    try:
        # Get operation values
        address                         = vesting_origination.data.originated_contract_address
        admin                           = vesting_origination.storage.admin
        total_vested_amount             = int(vesting_origination.storage.totalVestedAmount)
        timestamp                       = vesting_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = 'atlasnet')
    
        # Create record
        vesting = models.Vesting(
            address                         = address,
            network                         = 'atlasnet',
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            total_vested_amount             = total_vested_amount
        )
        await vesting.save()

    except BaseException as e:
        await save_error_report(e)

