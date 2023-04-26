from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.vault.storage import VaultStorage, Depositor as Any, Depositor1 as Whitelist
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_vault_origination(
    ctx: HandlerContext,
    vault_origination: Origination[VaultStorage],
) -> None:

    try:    
        # Get operation info
        vault_address           = vault_origination.data.originated_contract_address
        timestamp               = vault_origination.data.timestamp
        admin                   = vault_origination.storage.admin
        depositors              = vault_origination.storage.depositors
        name                    = vault_origination.storage.name
        whitelisted_addresses   = []
        allowance_type          = models.VaultAllowance.ANY
    
        if type(depositors) == Any:
            allowance_type          = models.VaultAllowance.ANY
        elif type(depositors) == Whitelist:
            allowance_type          = models.VaultAllowance.WHITELIST
            whitelisted_addresses   = depositors.whitelist
        
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=vault_address
        )
    
        # Check vault does not already exists
        vault_exists        =  await models.Vault.get_or_none(
            address     = vault_address
        )
    
        if not vault_exists:
            # Create vault record
            vault, _            = await models.Vault.get_or_create(
                address             = vault_address,
                admin               = admin,
                allowance           = allowance_type
            )
            vault.name                  = name
            vault.creation_timestamp    = timestamp
            vault.last_updated_at       = timestamp
            await vault.save()
    
            # Register depositors
            for depositor_address in whitelisted_addresses:
                depositor           = await models.mavryk_user_cache.get(address=depositor_address)
                vault_depositor, _  = await models.VaultDepositor.get_or_create(
                    vault       = vault,
                    depositor   = depositor
                )
                await vault_depositor.save()

    except BaseException:
         await save_error_report()

