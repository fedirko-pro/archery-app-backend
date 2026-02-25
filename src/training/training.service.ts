import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TrainingSession } from './training-session.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { User } from '../user/entity/user.entity';

@Injectable()
export class TrainingService {
  constructor(private readonly em: EntityManager) {}

  async create(
    userId: string,
    createDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const user = this.em.getReference(User, userId);
    const session = new TrainingSession();
    Object.assign(session, createDto);
    session.user = user;

    await this.em.persistAndFlush(session);
    return session;
  }

  async findAllForUser(userId: string): Promise<TrainingSession[]> {
    return this.em.find(
      TrainingSession,
      { user: { id: userId } },
      { orderBy: { date: 'DESC' } },
    );
  }

  async findOne(id: string, userId: string): Promise<TrainingSession> {
    const session = await this.em.findOne(TrainingSession, { id });

    if (!session) {
      throw new NotFoundException(`Training session with ID ${id} not found`);
    }

    await this.em.populate(session, ['user']);

    if ((session.user as User).id !== userId) {
      throw new ForbiddenException();
    }

    return session;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const session = await this.findOne(id, userId);
    Object.assign(session, updateDto);
    await this.em.flush();
    return session;
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    await this.em.removeAndFlush(session);
  }

  async bulkSync(
    userId: string,
    sessions: CreateTrainingSessionDto[],
  ): Promise<TrainingSession[]> {
    const user = this.em.getReference(User, userId);
    const created: TrainingSession[] = [];

    for (const dto of sessions) {
      const session = new TrainingSession();
      Object.assign(session, dto);
      session.user = user;
      this.em.persist(session);
      created.push(session);
    }

    await this.em.flush();
    return created;
  }
}
