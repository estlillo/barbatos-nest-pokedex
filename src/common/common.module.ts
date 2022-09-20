import { Module } from '@nestjs/common';
import { HttpAdapter } from './adapters/http.adapter';

@Module({
    providers: [HttpAdapter],
    exports: [HttpAdapter],
})
export class CommonModule {}
