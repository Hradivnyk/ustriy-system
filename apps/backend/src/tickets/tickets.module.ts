import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Specialist } from './entities/specialist.entity';
import { TicketStatus } from './entities/ticket-status.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketStatus, Specialist]),
    NotificationsModule,
    StaffModule,
  ],
  providers: [TicketsService, JwtAuthGuard],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
