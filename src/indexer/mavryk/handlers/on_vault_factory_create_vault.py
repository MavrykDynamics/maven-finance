from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from mavryk.utils.contracts import get_contract_metadata
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

    try:
        # Get operation info
        vault_factory_address   = create_vault.data.target_address
        baker_address           = create_vault.parameter.baker
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

        # Create a contract and index it
        vault_contract  =  f'{vault_address}contract'
        if not vault_contract in ctx.config.contracts: 
            await ctx.add_contract(
                name=vault_contract,
                address=vault_address,
                typename="vault"
            )
        vault_index     =  f'{vault_address}index'
        if not vault_index in ctx.config.indexes:
            await ctx.add_index(
                name=vault_index,
                template="vault_template",
                values=dict(
                    vault_contract=vault_contract
                )
            )

        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=vault_address
        )

        # Create vault record
        vault_factory       = await models.VaultFactory.get(
            network = ctx.datasource.network,
            address = vault_factory_address
        )
    
        # Check vault does not already exists
        # the vault can also be created through the lendingController vault registration entrypoint
        vault_exists            = await models.Vault.filter(
            network = ctx.datasource.network,
            address = vault_address
        ).exists()

        if vault_exists:
            vault               = await models.Vault.get(
                address             = vault_address,
                network             = ctx.datasource.network,
            )
            vault.metadata            = contract_metadata
            vault.name                = name
            vault.factory             = vault_factory
            vault.admin               = admin
            vault.allowance           = allowance_type
            vault.creation_timestamp  = timestamp
            vault.last_updated_at     = timestamp
        else:
            vault               = models.Vault(
                address             = vault_address,
                network             = ctx.datasource.network,
                metadata            = contract_metadata,
                name                = name,
                factory             = vault_factory,
                admin               = admin,
                allowance           = allowance_type,
                creation_timestamp  = timestamp,
                last_updated_at     = timestamp
            )

        # Create a baker or not
        if baker_address:
            baker       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=baker_address)
            vault.baker = baker

        # Save vault
        await vault.save()

        # Register depositors
        for depositor_address in whitelisted_addresses:
            depositor           = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=depositor_address)
            vault_depositor, _  = await models.VaultDepositor.get_or_create(
                vault       = vault,
                depositor   = depositor
            )
            await vault_depositor.save()

    except BaseException as e:
         await save_error_report(e)

