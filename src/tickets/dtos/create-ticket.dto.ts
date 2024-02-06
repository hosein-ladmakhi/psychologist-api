import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketDTO {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNumber()
  parent?: number;
}
