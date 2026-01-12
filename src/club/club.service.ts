import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Club } from './club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ClubService {
  constructor(
    private readonly em: EntityManager,
    private readonly uploadService: UploadService,
  ) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    const club = new Club();
    Object.assign(club, createClubDto);

    await this.em.persistAndFlush(club);
    return club;
  }

  async findAll(): Promise<Club[]> {
    return this.em.find(Club, {}, { orderBy: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.em.findOne(Club, { id });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async update(id: string, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    Object.assign(club, updateClubDto);
    await this.em.flush();

    return club;
  }

  async remove(id: string): Promise<void> {
    const club = await this.findOne(id);

    // Clean up logo file if exists
    if (club.clubLogo) {
      await this.uploadService.cleanupClubFiles(id);
    }

    await this.em.removeAndFlush(club);
  }
}
