import { IsInt, IsPositive } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsInt()
  @IsPositive()
  statusId!: number;
}
