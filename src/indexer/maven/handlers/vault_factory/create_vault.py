from maven import models as models
from maven.utils.contracts import get_contract_metadata
from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosOrigination
from dipdup.models.tezos import TezosTransaction
from maven.types.vault.tezos_storage import VaultStorage, Depositors as Any, Depositors1 as Whitelist
from maven.types.vault_factory.tezos_parameters.create_vault import CreateVaultParameter
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage

async def create_vault(
    ctx: HandlerContext,
    create_vault: TezosTransaction[CreateVaultParameter, VaultFactoryStorage],
    vault_origination: TezosOrigination[VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address       = create_vault.data.target_address
        baker_address               = create_vault.parameter.baker
        vault_address               = vault_origination.data.originated_contract_address
        timestamp                   = vault_origination.data.timestamp
        admin                       = vault_origination.storage.admin
        depositors                  = vault_origination.storage.depositors
        name                        = vault_origination.storage.name
        whitelisted_addresses       = []
        allowance_type              = models.VaultAllowance.ANY
        
        if type(depositors) == Any:
            allowance_type          = models.VaultAllowance.ANY
        elif type(depositors) == Whitelist:
            allowance_type          = models.VaultAllowance.WHITELIST
            whitelisted_addresses   = depositors.whitelist

        # Create a contract and index it
        # vault_contract  =  f'{vault_address}contract'
        # if not vault_contract in ctx.config.contracts: 
        #     await ctx.add_contract(
        #         kind="tezos",
        #         name=vault_contract,
        #         address=vault_address,
        #         typename="vault"
        #     )
        # vault_index     =  f'{vault_address}index'
        # if not vault_index in ctx.config.indexes:
        #     await ctx.add_index(
        #         name=vault_index,
        #         template="vault_template",
        #         values=dict(
        #             vault_contract=vault_contract
        #         )
        #     )

        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=vault_address
        )

        # Create vault record
        vault_factory       = await models.VaultFactory.get(
            network = 'atlasnet',
            address = vault_factory_address
        )
        
        vault, _            = await models.Vault.get_or_create(
            address             = vault_address,
            network             = 'atlasnet'
        )
        
        vault.metadata            = contract_metadata
        vault.name                = name
        vault.factory             = vault_factory
        vault.admin               = admin
        vault.allowance           = allowance_type
        vault.creation_timestamp  = timestamp
        vault.last_updated_at     = timestamp

        # Create a baker or not
        if baker_address:
            baker       = await models.get_user(network='atlasnet', address=baker_address)
            vault.baker = baker

        # Save vault
        await vault.save()

        # Register depositors
        for depositor_address in whitelisted_addresses:
            depositor           = await models.get_user(network='atlasnet', address=depositor_address)
            vault_depositor, _  = await models.VaultDepositor.get_or_create(
                vault       = vault,
                depositor   = depositor
            )
            await vault_depositor.save()

    except BaseException as e:
        await save_error_report(e)
