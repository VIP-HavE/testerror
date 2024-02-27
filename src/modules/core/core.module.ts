import { Module, DynamicModule } from '@nestjs/common';

// src/modules/core/core.module.ts
@Module({})
export class CoreModule {
    static forRoot(): DynamicModule {
        return {
            module: CoreModule,
            global: true,
            providers: [],
            exports: [],
        };
    }
}
