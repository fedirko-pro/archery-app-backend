import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateCountryDto): Promise<Country> {
    const code = dto.code.toUpperCase();
    const existing = await this.em.findOne(Country, { code });
    if (existing) throw new ConflictException('Country already exists');
    const country = this.em.create(Country, {
      ...dto,
      code,
      enabled: dto.enabled ?? true,
    });
    await this.em.persistAndFlush(country);
    return country;
  }

  async findAll(): Promise<Country[]> {
    return this.em.find(Country, {}, { orderBy: { name: 'ASC' } });
  }

  async findOne(code: string): Promise<Country> {
    const country = await this.em.findOne(Country, {
      code: code.toUpperCase(),
    });
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }

  async update(code: string, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(code);
    if (dto.code && dto.code.toUpperCase() !== country.code) {
      throw new ConflictException('Country code cannot be changed');
    }
    Object.assign(country, dto);
    country.updatedAt = new Date();
    await this.em.persistAndFlush(country);
    return country;
  }

  async remove(code: string): Promise<void> {
    const country = await this.findOne(code);
    await this.em.removeAndFlush(country);
  }
}
