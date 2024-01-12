import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationDTO {
  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
