import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CreateTicketDto } from './dto/create-ticket.dto';
import type { GetTicketsFilterDto } from './dto/get-tickets-filter.dto';
import { Specialist } from './entities/specialist.entity';
import { TicketStatus } from './entities/ticket-status.entity';
import { Ticket } from './entities/ticket.entity';

const DEFAULT_STATUSES = [
  'Новий',
  'в Обробці',
  'Відхилено',
  'На паузі',
  'Виконано',
];
const DEFAULT_SPECIALISTS = ['Електрик', 'Сантехник', 'Столяр'];

@Injectable()
export class TicketsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketStatus)
    private readonly statusRepository: Repository<TicketStatus>,
    @InjectRepository(Specialist)
    private readonly specialistRepository: Repository<Specialist>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.statusRepository
      .createQueryBuilder()
      .insert()
      .into(TicketStatus)
      .values(DEFAULT_STATUSES.map((name) => ({ name })))
      .orIgnore()
      .execute();

    await this.specialistRepository
      .createQueryBuilder()
      .insert()
      .into(Specialist)
      .values(DEFAULT_SPECIALISTS.map((name) => ({ name, isActive: true })))
      .orIgnore()
      .execute();
  }

  async findAllSpecialists(): Promise<Specialist[]> {
    return this.specialistRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findSpecialistById(id: number): Promise<Specialist | null> {
    return this.specialistRepository.findOne({ where: { id, isActive: true } });
  }

  async findAllStatuses(): Promise<TicketStatus[]> {
    return this.statusRepository.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const newStatus = await this.statusRepository.findOne({
      where: { name: 'Новий' },
    });

    if (!newStatus) {
      throw new NotFoundException('Статус «Новий» не знайдено');
    }

    const ticket = this.ticketRepository.create({
      residentId: dto.residentId,
      specialistId: dto.specialistId,
      dormitoryId: dto.dormitoryId,
      statusId: newStatus.id,
      description: dto.description,
    });

    return this.ticketRepository.save(ticket);
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { resident: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Заявку з id=${id} не знайдено`);
    }

    return ticket;
  }

  async findAll(filter: GetTicketsFilterDto): Promise<Ticket[]> {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.resident', 'resident')
      .leftJoinAndSelect('ticket.specialist', 'specialist')
      .leftJoinAndSelect('ticket.status', 'status')
      .leftJoinAndSelect('ticket.dormitory', 'dormitory')
      .orderBy('ticket.createdAt', 'DESC');

    if (filter.dormitoryId) {
      query.andWhere('ticket.dormitoryId = :dormitoryId', {
        dormitoryId: filter.dormitoryId,
      });
    }

    if (filter.specialistId) {
      query.andWhere('ticket.specialistId = :specialistId', {
        specialistId: filter.specialistId,
      });
    }

    return query.getMany();
  }

  async findActiveByResident(residentId: string): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.specialist', 'specialist')
      .leftJoinAndSelect('ticket.status', 'status')
      .where('ticket.residentId = :residentId', { residentId })
      .andWhere('status.name NOT IN (:...excluded)', {
        excluded: ['Відхилено', 'Виконано'],
      })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async findAllByResident(residentId: string): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.specialist', 'specialist')
      .leftJoinAndSelect('ticket.status', 'status')
      .where('ticket.residentId = :residentId', { residentId })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(id: string, statusId: number): Promise<Ticket> {
    const ticket = await this.findById(id);

    const status = await this.statusRepository.findOne({
      where: { id: statusId },
    });
    if (!status) {
      throw new NotFoundException(`Статус з id=${statusId} не знайдено`);
    }

    ticket.statusId = statusId;
    return this.ticketRepository.save(ticket);
  }
}
