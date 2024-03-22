import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateAdminDTO {
    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    @IsNotEmpty()
    @IsString()
    password: string
}