import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  password: string;
}
