from contextlib import AsyncExitStack
import asyncclick as click
from dipdup.cli import cli
from dipdup.config import DipDupConfig
from dipdup.context import DipDupContext
from dipdup.utils.database import tortoise_wrapper
from mavryk.utils.error_reporting import save_error_report

@cli.command(help='Start error reporting with dipdup')
@click.pass_context
async def test(ctx):
    """Run indexer.
    Execution can be gracefully interrupted with `Ctrl+C` or `SIGINT` signal.
    """
    from dipdup.config import DipDupConfig
    from dipdup.dipdup import DipDup

    config: DipDupConfig = ctx.obj.config
    config.initialize()

    dipdup = DipDup(config)

    try:
        await dipdup.run()
    # Error handling and pushing into the database
    except BaseException:
        await save_error_report()
    

if __name__ == '__main__':
    cli(prog_name='dipdup', standalone_mode=False)