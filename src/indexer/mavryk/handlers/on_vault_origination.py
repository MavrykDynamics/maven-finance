
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.vault.storage import VaultStorage, DepositorsConfigItem as Any, DepositorsConfigItem1 as Whitelist
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_vault_origination(
    ctx: HandlerContext,
    vault_origination: Origination[VaultStorage],
) -> None:
    
    # Get operation info
    vault_address       = vault_origination.data.originated_contract_address
    timestamp           = vault_origination.data.timestamp
    governance_address  = vault_origination.storage.governanceAddress
    admin               = vault_origination.storage.admin
    depositors          = vault_origination.storage.depositors
    allowance_type      = models.VaultAllowance.ANY

    if type(depositors) == Any:
        allowance_type  = models.VaultAllowance.ANY
    elif type(depositors) == Whitelist:
        allowance_type  = models.VaultAllowance.WHITELIST
    
    # Persist contract metadata
    await persist_contract_metadata(
        ctx=ctx,
        contract_address=vault_address
    )
    
    # Create vault record
    governance, _       = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()
    vault, _            = await models.Vault.get_or_create(
        address             = vault_address,
        admin               = admin,
        governance          = governance,
        allowance           = allowance_type
    )
    vault.creation_timestamp    = timestamp
    vault.last_updated_at       = timestamp
    await vault.save()

    # Register depositors
    for depositor_address in depositors.whitelistedDepositors:
        depositor           = await models.mavryk_user_cache.get(address=depositor_address)
        vault_depositor, _  = await models.VaultDepositor.get_or_create(
            vault       = vault,
            depositor   = depositor
        )
        await vault_depositor.save()
