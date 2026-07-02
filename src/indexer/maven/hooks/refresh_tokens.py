from dipdup.context import HookContext

from maven import models as models
from maven.utils.contracts import (
    refresh_maven_contract_metadata,
    refresh_token_metadata,
)


async def refresh_tokens(
    ctx: HookContext,
) -> None:
    # Periodically re-pull metadata from the metadata service. Metadata is
    # otherwise only fetched inside on-chain event handlers (at origination /
    # creation), so a token indexed before the service had published its
    # metadata would stay empty forever, and later metadata changes would be
    # missed. This job closes both gaps. Only non-empty, changed values are
    # written (see the refresh_* helpers), so a failing/empty service response
    # never overwrites good data.

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
