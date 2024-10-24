import maven.models as models
from maven.utils.contracts import get_token_standard, get_contract_metadata
from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosOrigination
from dipdup.models.tezos import TezosTransaction
from maven.types.lending_controller.tezos_parameters.register_vault_creation import RegisterVaultCreationParameter
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
from maven.types.vault.tezos_storage import VaultStorage, Depositors as Any, Depositors1 as Whitelist
from maven.types.vault_factory.tezos_parameters.create_vault import CreateVaultParameter
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from dateutil import parser

async def create_vault(
    ctx: HandlerContext,
    create_vault: TezosTransaction[CreateVaultParameter, VaultFactoryStorage],
    vault_origination: TezosOrigination[VaultStorage],
    register_vault_creation: TezosTransaction[RegisterVaultCreationParameter, LendingControllerStorage],
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
        lending_controller_address  = register_vault_creation.data.target_address
        timestamp                   = register_vault_creation.data.timestamp
        level                       = register_vault_creation.data.level
        operation_hash              = register_vault_creation.data.hash
        sender_address              = register_vault_creation.data.initiator_address
        vaults_storage              = register_vault_creation.storage.vaults
        vault_owner_address         = register_vault_creation.parameter.vaultOwner
    
        if type(depositors) == Any:
            allowance_type          = models.VaultAllowance.ANY
        elif type(depositors) == Whitelist:
            allowance_type          = models.VaultAllowance.WHITELIST
            whitelisted_addresses   = depositors.whitelist

        # Create a contract and index it
        vault_contract  =  f'{vault_address}contract'
        if not vault_contract in ctx.config.contracts: 
            await ctx.add_contract(
                kind="tezos",
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
            network = 'atlasnet',
            address = vault_factory_address
        )
    
        # Check vault does not already exists
        # the vault can also be created through the lendingController vault registration entrypoint
        vault_exists            = await models.Vault.filter(
            network = 'atlasnet',
            address = vault_address
        ).exists()

        if not vault_exists:
            vault               = models.Vault(
                address             = vault_address,
                network             = 'atlasnet',
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
                baker       = await models.maven_user_cache.get(network='atlasnet', address=baker_address)
                vault.baker = baker

            # Save vault
            await vault.save()

            # Register depositors
            for depositor_address in whitelisted_addresses:
                depositor           = await models.maven_user_cache.get(network='atlasnet', address=depositor_address)
                vault_depositor, _  = await models.VaultDepositor.get_or_create(
                    vault       = vault,
                    depositor   = depositor
                )
                await vault_depositor.save()

            # Register vault creation
            # Create / Update record
            lending_controller          = await models.LendingController.get(
                network         = 'atlasnet',
                address         = lending_controller_address,
            )
            vault_owner                 = await models.maven_user_cache.get(network='atlasnet', address=vault_owner_address)

            for vault_storage in vaults_storage:
                vault_address                           = vault_storage.value.address
                vault_loan_token_name                   = vault_storage.value.loanToken
                vault_loan_oustanding_total             = float(vault_storage.value.loanOutstandingTotal)
                vault_loan_principal_total              = float(vault_storage.value.loanPrincipalTotal)
                vault_loan_interest_total               = float(vault_storage.value.loanInterestTotal)
                vault_loan_decimals                     = float(vault_storage.value.loanDecimals)
                vault_borrow_index                      = float(vault_storage.value.borrowIndex)
                vault_last_updated_block_level          = int(vault_storage.value.lastUpdatedBlockLevel)
                vault_last_updated_timestamp            = parser.parse(vault_storage.value.lastUpdatedTimestamp)
                vault_marked_for_liquidation_level      = int(vault_storage.value.markedForLiquidationLevel)
                vault_liquidation_end_level             = int(vault_storage.value.liquidationEndLevel)
                vault_internal_id                       = int(vault_storage.key.id)
        
                lending_controller_loan_token               = await models.LendingControllerLoanToken.get(
                    lending_controller  = lending_controller,
                    loan_token_name     = vault_loan_token_name
                )

                lending_controller_vault, _                 = await models.LendingControllerVault.get_or_create(
                    lending_controller  = lending_controller,
                    vault               = vault,
                    owner               = vault_owner,
                    loan_token          = lending_controller_loan_token
                )
                lending_controller_vault.internal_id                        = vault_internal_id
                lending_controller_vault.loan_outstanding_total             = vault_loan_oustanding_total
                lending_controller_vault.loan_principal_total               = vault_loan_principal_total
                lending_controller_vault.loan_interest_total                = vault_loan_interest_total
                lending_controller_vault.loan_decimals                      = vault_loan_decimals
                lending_controller_vault.borrow_index                       = vault_borrow_index
                lending_controller_vault.last_updated_block_level           = vault_last_updated_block_level
                lending_controller_vault.last_updated_timestamp             = vault_last_updated_timestamp
                lending_controller_vault.marked_for_liquidation_level       = vault_marked_for_liquidation_level
                lending_controller_vault.liquidation_end_level              = vault_liquidation_end_level
                await lending_controller_vault.save()
        
                # Save history data
                sender                                  = await models.maven_user_cache.get(network='atlasnet', address=sender_address)
                history_data                            = models.LendingControllerHistoryData(
                    lending_controller  = lending_controller,
                    loan_token          = lending_controller_loan_token,
                    vault               = lending_controller_vault,
                    sender              = sender,
                    operation_hash      = operation_hash,
                    timestamp           = timestamp,
                    level               = level,
                    type                = models.LendingControllerOperationType.VAULT_CREATION,
                    amount              = 0
                )
                await history_data.save()

    except BaseException as e:
        await save_error_report(e)
