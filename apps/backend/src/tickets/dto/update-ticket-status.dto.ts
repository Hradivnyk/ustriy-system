import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsInt()
  @IsPositive()
  statusId!: number;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
