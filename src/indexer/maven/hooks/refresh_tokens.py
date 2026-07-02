from dipdup.context import HookContext

from maven import models as models
from maven.utils.contracts import (
    refresh_maven_contract_metadata,
    refresh_token_metadata,
)


async def refresh_tokens(
    ctx: HookContext,
) -> None:
    updated_tokens = 0
    updated_contracts = 0

    # Token-level metadata (TZIP-12: name / symbol / decimals / thumbnail),
    # exposed as token.metadata (and via token0 / token1 / lp_token / the
    # `token` relation of m_tokens & farms).
    for token in await models.Token.filter(network=models.NETWORK):
        try:
            if await refresh_token_metadata(ctx, token):
                updated_tokens += 1
        except BaseException as e:
            print(f"refresh_tokens: failed to refresh token {token.token_address}: {e}")

    # Contract-level metadata (TZIP-16) for the token-bearing contracts the API
    # exposes as m_tokens.metadata and farms_lp_tokens.metadata.
    for model in (models.MToken, models.Farm):
        for contract in await model.filter(network=models.NETWORK):
            try:
                if await refresh_maven_contract_metadata(ctx, contract):
                    updated_contracts += 1
            except BaseException as e:
                print(f"refresh_tokens: failed to refresh contract {contract.address}: {e}")

    print(
        f"refresh_tokens: updated metadata for {updated_tokens} token(s) "
        f"and {updated_contracts} contract(s)"
    )
