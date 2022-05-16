import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { AdminModule } from '@mavryk-oracle-node/admin';
import { OracleModule } from '@mavryk-oracle-node/oracle';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  public static forRoot(): DynamicModule {
    const imports: ModuleMetadata['imports'] = [];

    if (process.env['ENABLE_MAINTAINER_MODE'] === 'true') {
      imports.push(AdminModule);
    }

    if (
      process.env['ENABLE_ORACLE_MODE'] === undefined ||
      process.env['ENABLE_ORACLE_MODE'] === 'true'
    ) {
      imports.push(OracleModule);
    }

    return {
      module: AppModule,
      imports: imports,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  configure(consumer: MiddlewareConsumer): any {
    // No op
  }
}
