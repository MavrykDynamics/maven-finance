from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.contracts import get_contract_metadata, get_token_standard, get_contract_token_metadata
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktOrigination
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.farm_factory.tezos_parameters.create_farm_m_token import CreateFarmMTokenParameter
from mavryk.types.farm_factory.tezos_storage import FarmFactoryStorage
from mavryk.types.m_farm.tezos_storage import MFarmStorage
import mavryk.models as models
import json
import datetime

async def create_farm_m_token(
    ctx: HandlerContext,
    create_farm_m_token: TzktTransaction[CreateFarmMTokenParameter, FarmFactoryStorage],
    m_farm_origination: TzktOrigination[MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = m_farm_origination.data.originated_contract_address
        farm_factory_address            = create_farm_m_token.data.target_address
        admin                           = m_farm_origination.storage.admin
        name                            = m_farm_origination.storage.name
        creation_timestamp              = m_farm_origination.data.timestamp
        force_rewards_from_transfer     = m_farm_origination.storage.config.forceRewardFromTransfer
        infinite                        = m_farm_origination.storage.config.infinite
        loan_token_name                 = m_farm_origination.storage.config.loanToken
        lp_token_address                = m_farm_origination.storage.config.lpToken.tokenAddress
        lp_token_id                     = int(m_farm_origination.storage.config.lpToken.tokenId)
        lp_token_balance                = int(m_farm_origination.storage.config.lpToken.tokenBalance)
        total_blocks                    = int(m_farm_origination.storage.config.plannedRewards.totalBlocks)
        current_reward_per_block        = int(m_farm_origination.storage.config.plannedRewards.currentRewardPerBlock)
        total_rewards                   = int(m_farm_origination.storage.config.plannedRewards.totalRewards)
        deposit_paused                  = m_farm_origination.storage.breakGlassConfig.depositIsPaused
        withdraw_paused                 = m_farm_origination.storage.breakGlassConfig.withdrawIsPaused
        claim_paused                    = m_farm_origination.storage.breakGlassConfig.claimIsPaused
        last_block_update               = int(m_farm_origination.storage.lastBlockUpdate)
        open                            = m_farm_origination.storage.open
        init                            = m_farm_origination.storage.init
        init_block                      = int(m_farm_origination.storage.initBlock)
        accumulated_rewards_per_share   = float(m_farm_origination.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(m_farm_origination.storage.claimedRewards.unpaid)
        paid_rewards                    = float(m_farm_origination.storage.claimedRewards.paid)
        contract_metadata               = json.loads(bytes.fromhex(create_farm_m_token.parameter.metadata).decode('utf-8'))
        min_block_time_snapshot         = int(m_farm_origination.storage.minBlockTimeSnapshot)
        start_timestamp                 = creation_timestamp
        end_timestamp                   = None
        if not infinite:
            farm_duration   = min_block_time_snapshot * total_blocks
            end_timestamp   = start_timestamp + datetime.timedelta(seconds=farm_duration)
    
        # Check farm does not already exists
        farm_exists                     = await models.Farm.filter(
            network     = ctx.datasource.name.replace('tzkt_',''),
            address     = farm_address
        ).exists()
    
        if not farm_exists:
            # Create a contract and index it
            farm_contract   =  f'{farm_address}contract'
            if not farm_contract in ctx.config.contracts: 
                await ctx.add_contract(
                    kind="tezos",
                    name=farm_contract,
                    address=farm_address,
                    typename="m_farm"
                )
            farm_index     =  f'{farm_address}index'
            if not farm_index in ctx.config.indexes:
                await ctx.add_index(
                    name=farm_index,
                    template="m_farm_template",
                    values=dict(
                        m_farm_contract=farm_contract
                    )
                )
    
            # Get Farm Contract Metadata and save the two Tokens involved in the LP Token
            token0_address              = None
            token1_address              = None
    
            if type(contract_metadata) is dict and contract_metadata and 'liquidityPairToken' in contract_metadata and 'token0' in contract_metadata['liquidityPairToken'] and 'tokenAddress' in contract_metadata['liquidityPairToken']['token0'] and len(contract_metadata['liquidityPairToken']['token0']['tokenAddress']) > 0:
                token0_address  = contract_metadata['liquidityPairToken']['token0']['tokenAddress'][0]
            if type(contract_metadata) is dict and contract_metadata and 'liquidityPairToken' in contract_metadata and 'token1' in contract_metadata['liquidityPairToken'] and 'tokenAddress' in contract_metadata['liquidityPairToken']['token1'] and len(contract_metadata['liquidityPairToken']['token1']['tokenAddress']) > 0:
                token1_address  = contract_metadata['liquidityPairToken']['token1']['tokenAddress'][0]

            token0                      = None
            if token0_address:
                token_contract_metadata = await get_contract_token_metadata(
                    ctx=ctx,
                    token_address=token0_address
                )

                # Get the token standard
                standard                = await get_token_standard(
                    ctx,
                    token0_address
                )

                # Get the related token
                token0, _               = await models.Token.get_or_create(
                    token_address       = token0_address,
                    network             = ctx.datasource.name.replace('tzkt_','')
                )
                if token_contract_metadata:
                    token0.metadata          = token_contract_metadata
                token0.token_standard   = standard
                await token0.save()
    
            token1                      = None
            if token1_address: 
                token_contract_metadata = await get_contract_token_metadata(
                        ctx=ctx,
                    token_address=token1_address
                )

                # Get the token standard
                standard = await get_token_standard(
                    ctx,
                    token1_address
                )

                # Get the related token
                token1, _               = await models.Token.get_or_create(
                    token_address       = token1_address,
                    network             = ctx.datasource.name.replace('tzkt_','')
                )
                if token_contract_metadata:
                    token1.metadata          = token_contract_metadata
                token1.token_standard   = standard
                await token1.save()

            # Get contract metadata
            contract_metadata = await get_contract_metadata(
                ctx=ctx,
                contract_address=farm_address
            )
    
            # Persist LP Token Metadata
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=lp_token_address,
                token_id=str(lp_token_id)
            )

            # Get the token standard
            standard = await get_token_standard(
                ctx,
                lp_token_address
            )

            # Get the related token
            lp_token, _                 = await models.Token.get_or_create(
                token_address       = lp_token_address,
                token_id            = lp_token_id,
                network             = ctx.datasource.name.replace('tzkt_','')
            )
            if token_contract_metadata:
                lp_token.metadata          = token_contract_metadata
            lp_token.token_standard     = standard
            await lp_token.save()
    
            # Create record
            farm_factory    = await models.FarmFactory.get(
                network = ctx.datasource.name.replace('tzkt_',''),
                address = farm_factory_address
            )
            governance      = await models.Governance.get(
                network = ctx.datasource.name.replace('tzkt_','')
            )
            farm            = models.Farm(
                address                         = farm_address,
                network                         = ctx.datasource.name.replace('tzkt_',''),
                lp_token                        = lp_token,
                metadata                        = contract_metadata,
                governance                      = governance,
                admin                           = admin,
                name                            = name,
                creation_timestamp              = creation_timestamp,
                start_timestamp                 = start_timestamp,
                end_timestamp                   = end_timestamp,
                min_block_time_snapshot         = min_block_time_snapshot,
                factory                         = farm_factory,
                force_rewards_from_transfer     = force_rewards_from_transfer,
                infinite                        = infinite,
                lp_token_balance                = lp_token_balance,
                loan_token_name                 = loan_token_name,
                token0                          = token0,
                token1                          = token1,
                total_blocks                    = total_blocks,
                current_reward_per_block        = current_reward_per_block,
                total_rewards                   = total_rewards,
                deposit_paused                  = deposit_paused,
                withdraw_paused                 = withdraw_paused,
                claim_paused                    = claim_paused,
                last_block_update               = last_block_update,
                open                            = open,
                init                            = init,
                init_block                      = init_block,
                accumulated_rewards_per_share   = accumulated_rewards_per_share,
                unpaid_rewards                  = unpaid_rewards,
                paid_rewards                    = paid_rewards,
                is_m_farm                       = True
            )
            await farm.save()

    except BaseException as e:
        await save_error_report(e)

