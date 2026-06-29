# --- Workaround for the DipDup Hasura timeout bug (stock 8.2.2 AND mavryk fork 8.4.2) -
# DipDup's `_set_up_hasura` builds HasuraGateway WITHOUT passing `hasura.http`, so the
# gateway always uses the default 60s request_timeout regardless of what you set in
# `hasura.http.request_timeout`. Verified still present in the mavryk-network fork
# (branch hasura-model-comment / 8.4.2). This project's Hasura "table customization" is
# a single bulk request over ~142 tables that takes longer than 60s, so configuration
# always times out (locally and in the cluster, independent of resources).
#
# Until DipDup wires `hasura.http` through, raise the gateway's default request timeout
# here. This module is imported during "Loading package maven", before Hasura is
# configured, and ships inside the indexer image.
from dipdup.config import HttpConfig as _HttpConfig
from dipdup.hasura import HasuraGateway as _HasuraGateway

_HasuraGateway._default_http_config = _HttpConfig(
    retry_sleep=1,
    retry_multiplier=1.1,
    retry_count=3,
    request_timeout=1200,
    alias='hasura',
    replay=False,
)
# ----------------------------------------------------------------------------------

