from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_contract_token_metadata, get_token_standard
from maven.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.lending_controller_mock_time.tezos_parameters.set_collateral_token import SetCollateralTokenParameter, Action as createCollateralToken
import maven.models as models

async def set_collateral_token(
    ctx: HandlerContext,
    set_collateral_token: TezosTransaction[SetCollateralTokenParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Get operation info
        action_class                    = type(set_collateral_token.parameter.action)
        if action_class == createCollateralToken:
            collateral_token_name       = set_collateral_token.parameter.action.createCollateralToken.tokenName
        else:
            collateral_token_name       = set_collateral_token.parameter.action.updateCollateralToken.tokenName
    
        lending_controller_address      = set_collateral_token.data.target_address
        if collateral_token_name in set_collateral_token.storage.collateralTokenLedger:
            collateral_token_storage                    = set_collateral_token.storage.collateralTokenLedger[collateral_token_name]
            collateral_token_oracle_address             = collateral_token_storage.oracleAddress
            collateral_token_address                    = collateral_token_storage.tokenContractAddress
            collateral_token_protected                  = collateral_token_storage.protected
            collateral_token_scaled                     = collateral_token_storage.isScaledToken
            collateral_token_staked                     = collateral_token_storage.isStakedToken
            collateral_token_staking_contract_address   = collateral_token_storage.stakingContractAddress
            collateral_token_total_deposited            = float(collateral_token_storage.totalDeposited)
            collateral_token_paused                     = collateral_token_storage.isPaused
            collateral_token_id                         = 0
            collateral_token_max_deposit_amount         = collateral_token_storage.maxDepositAmount
            if collateral_token_storage.maxDepositAmount:
                collateral_token_max_deposit_amount         = float(collateral_token_max_deposit_amount)
    
            # Persist collateral Token Metadata
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=collateral_token_address,
                token_id=str(collateral_token_id)
            )

            # Get the token standard
            standard = await get_token_standard(
                ctx,
                collateral_token_address
            )

            # Get the related token
            token, _                                    = await models.Token.get_or_create(
                token_address       = collateral_token_address,
                token_id            = collateral_token_id,
                network             = 'atlasnet'
            )
            if token_contract_metadata:
                token.metadata          = token_contract_metadata
            token.token_standard    = standard
            await token.save()
    
            # Create / Update record
            lending_controller          = await models.LendingController.get(
                network         = 'atlasnet',
                address         = lending_controller_address,
            )
            oracle                      = await models.maven_user_cache.get(network='atlasnet', address=collateral_token_oracle_address)
            lending_controller_collateral_token, _  = await models.LendingControllerCollateralToken.get_or_create(
                lending_controller  = lending_controller,
                token               = token,
                oracle              = oracle
            )
            lending_controller_collateral_token.protected                                   = collateral_token_protected
            lending_controller_collateral_token.is_scaled_token                             = collateral_token_scaled
            lending_controller_collateral_token.token_name                                  = collateral_token_name
            lending_controller_collateral_token.is_staked_token                             = collateral_token_staked
            lending_controller_collateral_token.staking_contract_address                    = collateral_token_staking_contract_address
            lending_controller_collateral_token.total_deposited                             = collateral_token_total_deposited
            lending_controller_collateral_token.max_deposit_amount                          = collateral_token_max_deposit_amount
            lending_controller_collateral_token.paused                                      = collateral_token_paused
            await lending_controller_collateral_token.save()

    except BaseException as e:
        await save_error_report(e)

