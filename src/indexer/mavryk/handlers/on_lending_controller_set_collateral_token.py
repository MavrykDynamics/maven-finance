
from mavryk.utils.persisters import persist_token_metadata
from mavryk.types.lending_controller.parameter.set_collateral_token import SetCollateralTokenParameter, ActionItem as createCollateralToken
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_lending_controller_set_collateral_token(
    ctx: HandlerContext,
    set_collateral_token: Transaction[SetCollateralTokenParameter, LendingControllerStorage],
) -> None:

    # Get operation info
    action_class                    = type(set_collateral_token.parameter.action)
    if action_class == createCollateralToken:
        collateral_token_name       = set_collateral_token.parameter.action.createCollateralToken.tokenName
    else:
        collateral_token_name       = set_collateral_token.parameter.action.updateCollateralToken.tokenName

    lending_controller_address      = set_collateral_token.data.target_address
    if collateral_token_name in set_collateral_token.storage.collateralTokenLedger:
        collateral_token_storage        = set_collateral_token.storage.collateralTokenLedger[collateral_token_name]
        collateral_token_oracle_address = collateral_token_storage.oracleAddress
        collateral_token_address        = collateral_token_storage.tokenContractAddress
        collateral_token_id             = 0

        # Persist collateral Token Metadata
        await persist_token_metadata(
            ctx=ctx,
            token_address=collateral_token_address,
            token_id=str(collateral_token_id)
        )

        # Create / Update record
        lending_controller          = await models.LendingController.get(
            address = lending_controller_address
        )
        oracle, _                   = await models.MavrykUser.get_or_create(
            address = collateral_token_oracle_address
        )
        await oracle.save()
        lending_controller_collateral_token, _  = await models.LendingControllerCollateralToken.get_or_create(
            lending_controller  = lending_controller,
            token_address       = collateral_token_address,
            oracle              = oracle
        )
        await lending_controller_collateral_token.save()
