from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.create_treasury import CreateTreasuryParameter
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.models import Origination
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_create_treasury(
    ctx: HandlerContext,
    create_treasury: Transaction[CreateTreasuryParameter, TreasuryFactoryStorage],
    treasury_origination: Origination[TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address                = treasury_origination.data.originated_contract_address
        baker_address                   = create_treasury.parameter.baker
        level                           = create_treasury.data.level
        treasury_factory_address        = create_treasury.data.target_address
        admin                           = treasury_origination.storage.admin
        governance_address              = treasury_origination.storage.governanceAddress
        name                            = treasury_origination.storage.name
        creation_timestamp              = treasury_origination.data.timestamp
        transfer_paused                 = treasury_origination.storage.breakGlassConfig.transferIsPaused
        mint_mvk_and_transfer_paused    = treasury_origination.storage.breakGlassConfig.mintMvkAndTransferIsPaused
        stake_mvk_paused                = treasury_origination.storage.breakGlassConfig.stakeMvkIsPaused
        unstake_mvk_paused              = treasury_origination.storage.breakGlassConfig.unstakeMvkIsPaused
    
        # Check treasury does not already exists
        treasury_exists                     = await models.Treasury.get_or_none(
            network     = ctx.datasource.network,
            address     = treasury_address
        )
    
        if not treasury_exists:
            # Create a contract and index it
            treasury_contract                       =  f'{treasury_address}contract'
            if not treasury_contract in ctx.config.contracts: 
                await ctx.add_contract(
                    name=treasury_contract,
                    address=treasury_address,
                    typename="treasury"
                )
            treasury_index                          =  f'{treasury_address}index'
            if not treasury_index in ctx.config.indexes:
                await ctx.add_index(
                    name=treasury_index,
                    template="treasury_template",
                    values=dict(
                        treasury_contract=treasury_contract
                    )
                )
            treasury_token_transfer_receiver_index  =  f'{treasury_address}token_transfer_receiver_index'
            if not treasury_token_transfer_receiver_index in ctx.config.indexes:
                await ctx.add_index(
                    name=treasury_token_transfer_receiver_index,
                    template="treasury_token_transfer_receiver_template",
                    values=dict(
                        treasury_contract   = treasury_contract,
                        first_level         = level
                    )
                )
    
            # Get contract metadata
            contract_metadata = await get_contract_metadata(
                ctx=ctx,
                contract_address=treasury_address
            )
    
            # Create record
            treasury_factory    = await models.TreasuryFactory.get(
                network = ctx.datasource.network,
                address = treasury_factory_address
            )
            governance          = await models.Governance.get(
                network = ctx.datasource.network,
                address = governance_address
            )
            treasury, _         = await models.Treasury.get_or_create(
                address                         = treasury_address,
                network                         = ctx.datasource.network
            )
            treasury.metadata                        = contract_metadata
            treasury.governance                      = governance
            treasury.admin                           = admin
            treasury.name                            = name
            treasury.creation_timestamp              = creation_timestamp
            treasury.factory                         = treasury_factory
            treasury.transfer_paused                 = transfer_paused
            treasury.mint_mvk_and_transfer_paused    = mint_mvk_and_transfer_paused
            treasury.stake_mvk_paused                = stake_mvk_paused
            treasury.unstake_mvk_paused              = unstake_mvk_paused
    
            # Create a baker or not
            if baker_address:
                baker       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=baker_address)
                treasury.baker = baker
    
            await treasury.save()

    except BaseException as e:
         await save_error_report(e)

