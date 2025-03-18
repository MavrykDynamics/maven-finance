from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_contract_metadata
from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from maven.types.treasury_factory.tezos_parameters.create_treasury import CreateTreasuryParameter
from maven.types.treasury.tezos_storage import TreasuryStorage
from dipdup.models.tezos import TezosOrigination
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def create_treasury(
    ctx: HandlerContext,
    create_treasury: TezosTransaction[CreateTreasuryParameter, TreasuryFactoryStorage],
    treasury_origination: TezosOrigination[TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address                = treasury_origination.data.originated_contract_address
        baker_address                   = create_treasury.parameter.baker
        level                           = create_treasury.data.level
        treasury_factory_address        = create_treasury.data.target_address
        admin                           = treasury_origination.storage.admin
        name                            = treasury_origination.storage.name
        creation_timestamp              = treasury_origination.data.timestamp
        transfer_paused                 = treasury_origination.storage.breakGlassConfig.transferIsPaused
        mint_mvn_and_transfer_paused    = treasury_origination.storage.breakGlassConfig.mintMvnAndTransferIsPaused
        update_token_operators_paused   = treasury_origination.storage.breakGlassConfig.updateTokenOperatorsIsPaused
        stake_tokens_paused             = treasury_origination.storage.breakGlassConfig.stakeTokensIsPaused
        unstake_tokens_paused           = treasury_origination.storage.breakGlassConfig.unstakeTokensIsPaused
    
        # Check treasury does not already exists
        treasury_exists                     = await models.Treasury.filter(
            network     = 'atlasnet',
            address     = treasury_address
        ).exists()
    
        if not treasury_exists:
            # Create a contract and index it
            treasury_contract                       =  f'{treasury_address}contract'
            if not treasury_contract in ctx.config.contracts: 
                await ctx.add_contract(
                    kind="tezos",
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
                network = 'atlasnet',
                address = treasury_factory_address
            )
            governance          = await models.Governance.get(
                network = 'atlasnet'
            )
            treasury            = models.Treasury(
                address                         = treasury_address,
                network                         = 'atlasnet',
                metadata                        = contract_metadata,
                governance                      = governance,
                admin                           = admin,
                name                            = name,
                creation_timestamp              = creation_timestamp,
                factory                         = treasury_factory,
                transfer_paused                 = transfer_paused,
                mint_mvn_and_transfer_paused    = mint_mvn_and_transfer_paused,
                update_token_operators_paused   = update_token_operators_paused,
                stake_tokens_paused             = stake_tokens_paused,
                unstake_tokens_paused           = unstake_tokens_paused
            )
    
            # Create a baker or not
            if baker_address:
                baker       = await models.maven_user_cache.get(network='atlasnet', address=baker_address)
                treasury.baker = baker
    
            await treasury.save()

    except BaseException as e:
        await save_error_report(e)

