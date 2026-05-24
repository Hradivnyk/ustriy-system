import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetTicketsFilterDto } from './dto/get-tickets-filter.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tickets')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Список заявок з фільтрацією' })
  @Get()
  findAll(@Query() filter: GetTicketsFilterDto) {
    return this.ticketsService.findAll(filter);
  }

  @ApiOperation({ summary: 'Отримати заявку за ID' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const ticket = await this.ticketsService.findById(id);
    if (!ticket) throw new NotFoundException();
    return ticket;
  }

  @ApiOperation({ summary: 'Змінити статус заявки' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, dto.statusId);
  }
}
