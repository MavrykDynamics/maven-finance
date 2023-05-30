from mavryk.utils.contracts import get_token_standard
from mavryk.utils.error_reporting import save_error_report

from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.register_vault_creation import RegisterVaultCreationParameter
import mavryk.models as models
from dateutil import parser

async def on_lending_controller_mock_time_register_vault_creation(
    ctx: HandlerContext,
    register_vault_creation: Transaction[RegisterVaultCreationParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address  = register_vault_creation.data.target_address
        timestamp                   = register_vault_creation.data.timestamp
        level                       = register_vault_creation.data.level
        operation_hash              = register_vault_creation.data.hash
        sender_address              = register_vault_creation.data.initiator_address
        vaults_storage              = register_vault_creation.storage.vaults
        vault_owner_address         = register_vault_creation.parameter.vaultOwner
    
        # Create / Update record
        lending_controller          = await models.LendingController.get(
            network         = ctx.datasource.network,
            address         = lending_controller_address,
            mock_time       = True
        )
        vault_owner                 = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vault_owner_address)

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
            loan_token_storage                      = register_vault_creation.storage.loanTokenLedger[vault_loan_token_name]
            loan_token_type_storage                 = loan_token_storage.tokenType
            loan_token_address                      = None
            loan_token_id                           = 0

            # Get loan token address
            if type(loan_token_type_storage) == fa12:
                loan_token_address          = loan_token_type_storage.fa12
            elif type(loan_token_type_storage) == fa2:
                loan_token_address          = loan_token_type_storage.fa2.tokenContractAddress
                loan_token_id               = int(loan_token_type_storage.fa2.tokenId)
            elif type(loan_token_type_storage) == tez:
                loan_token_address          = "XTZ"

            token                                   = None
            if loan_token_address:

                # Get the token standard
                standard = await get_token_standard(
                    ctx,
                    loan_token_address
                )

                # Get the related token
                token, _                                = await models.Token.get_or_create(
                    token_address       = loan_token_address,
                    network             = ctx.datasource.network,
                    token_id            = loan_token_id
                )
                token.token_standard    = standard
                await token.save()
    
            lending_controller_loan_token               = await models.LendingControllerLoanToken.get(
                lending_controller  = lending_controller,
                token               = token,
                loan_token_name     = vault_loan_token_name
            )
            vault_exists                                = await models.Vault.filter(
                network = ctx.datasource.network,
                address = vault_address
            ).exists()
            if vault_exists:
                vault                                   = await models.Vault.get(
                    network = ctx.datasource.network,
                    address = vault_address
                )
            else:
                vault_factory                           = await models.VaultFactory.get(
                    network             = ctx.datasource.network
                )
                vault                                   = models.Vault(
                    network             = ctx.datasource.network,
                    address             = vault_address,
                    creation_timestamp  = timestamp,
                    vault_factory       = vault_factory
                )
                await vault.save()
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
            sender                                  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=sender_address)
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

