import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Federation } from './federation.entity';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';

@Injectable()
export class FederationService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateFederationDto): Promise<Federation> {
    const existing = await this.em.findOne(Federation, {
      shortCode: dto.shortCode,
    });
    if (existing) {
      throw new ConflictException(
        'Federation with this shortCode already exists',
      );
    }

    const { countryCode, ...federationData } = dto;
    const federation = this.em.create(Federation, {
      ...federationData,
      country: { code: countryCode.toUpperCase() },
    });

    await this.em.persistAndFlush(federation);
    return federation;
  }

  async findAll(): Promise<Federation[]> {
    return this.em.find(
      Federation,
      {},
      { orderBy: { name: 'ASC' }, populate: ['country'] },
    );
  }

  async findOne(id: string): Promise<Federation> {
    const federation = await this.em.findOne(
      Federation,
      { id },
      { populate: ['country'] },
    );
    if (!federation) throw new NotFoundException('Federation not found');
    return federation;
  }

  async update(id: string, dto: UpdateFederationDto): Promise<Federation> {
    const federation = await this.findOne(id);
    if (dto.shortCode && dto.shortCode !== federation.shortCode) {
      const existing = await this.em.findOne(Federation, {
        shortCode: dto.shortCode,
      });
      if (existing)
        throw new ConflictException(
          'Federation with this shortCode already exists',
        );
    }

    const { countryCode, ...updateData } = dto;

    if (countryCode) {
      federation.country = { code: countryCode.toUpperCase() } as any;
    }

    Object.assign(federation, updateData);
    federation.updatedAt = new Date();
    await this.em.persistAndFlush(federation);
    return federation;
  }

  async remove(id: string): Promise<void> {
    const federation = await this.findOne(id);
    await this.em.removeAndFlush(federation);
  }
}
