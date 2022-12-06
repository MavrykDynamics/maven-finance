
from dipdup.models import Origination
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.vault_factory.parameter.create_vault import CreateVaultParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault.storage import VaultStorage, Depositor as Any, Depositor1 as Whitelist
import mavryk.models as models

async def on_vault_factory_create_vault(
    ctx: HandlerContext,
    create_vault: Transaction[CreateVaultParameter, VaultFactoryStorage],
    vault_origination: Origination[VaultStorage],
) -> None:

    # Get operation info
    vault_factory_address   = create_vault.data.target_address
    vault_address           = vault_origination.data.originated_contract_address
    timestamp               = vault_origination.data.timestamp
    governance_address      = vault_origination.storage.governanceAddress
    admin                   = vault_origination.storage.admin
    depositors              = vault_origination.storage.depositors
    allowance_type          = models.VaultAllowance.ANY

    if type(depositors) == Any:
        allowance_type  = models.VaultAllowance.ANY
    elif type(depositors) == Whitelist:
        allowance_type  = models.VaultAllowance.WHITELIST

    # Check vault does not already exists
    vault_exists            = await models.Vault.get_or_none(
        address = vault_address
    )

    if not vault_exists:
        # Create a contract and index it
        await ctx.add_contract(
            name=vault_address + 'contract',
            address=vault_address,
            typename="vault"
        )
        await ctx.add_index(
            name=vault_address + 'index',
            template="vault_template",
            values=dict(
                vault_contract=vault_address + 'contract'
            )
        )

        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=vault_address
        )

        # Create vault record
        vault_factory       = await models.VaultFactory.get(
            address = vault_factory_address
        )
        governance, _       = await models.Governance.get_or_create(
            address = governance_address
        )
        await governance.save()
        vault, _            = await models.Vault.get_or_create(
            address             = vault_address
        )
        vault.factory               = vault_factory
        vault.admin                 = admin
        vault.governance            = governance
        vault.allowance             = allowance_type
        vault.creation_timestamp    = timestamp
        vault.last_updated_at       = timestamp
        await vault.save()

        # Register depositors
        if type(depositors) == Whitelist:
            for depositor_address in depositors.whitelist:
                depositor           = await models.mavryk_user_cache.get(address=depositor_address)
                vault_depositor, _  = await models.VaultDepositor.get_or_create(
                    vault       = vault,
                    depositor   = depositor
                )
                await vault_depositor.save()
