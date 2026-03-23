import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Country } from './country.entity';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Country])],
  providers: [CountryService],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
