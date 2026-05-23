import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  residentId!: string;

  @IsInt()
  @IsPositive()
  specialistId!: number;

  @IsInt()
  @IsPositive()
  dormitoryId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}
