from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Origination
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_origination(
    ctx: HandlerContext,
    treasury_origination: Origination[TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address                = treasury_origination.data.originated_contract_address
        admin                           = treasury_origination.storage.admin
        name                            = treasury_origination.storage.name
        creation_timestamp              = treasury_origination.data.timestamp
        governance_address              = treasury_origination.storage.governanceAddress
        transfer_paused                 = treasury_origination.storage.breakGlassConfig.transferIsPaused
        mint_mvk_and_transfer_paused    = treasury_origination.storage.breakGlassConfig.mintMvkAndTransferIsPaused
        stake_mvk_paused                = treasury_origination.storage.breakGlassConfig.stakeMvkIsPaused
        unstake_mvk_paused              = treasury_origination.storage.breakGlassConfig.unstakeMvkIsPaused
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=treasury_address
        )
        
        # Create record
        governance, _                   = await models.Governance.get_or_create(
            address = governance_address
        )
        await governance.save()
    
        # Check treasury does not already exists
        treasury_exists                     = await models.Treasury.get_or_none(
            address     = treasury_address
        )
    
        if not treasury_exists:
            treasury            = models.Treasury(
                address                         = treasury_address,
                admin                           = admin,
                last_updated_at                 = creation_timestamp,
                governance                      = governance,
                creation_timestamp              = creation_timestamp,
                name                            = name,
                transfer_paused                 = transfer_paused,
                mint_mvk_and_transfer_paused    = mint_mvk_and_transfer_paused,
                stake_mvk_paused                = stake_mvk_paused,
                unstake_mvk_paused              = unstake_mvk_paused
            )
            await treasury.save()

    except BaseException:
         await save_error_report()

