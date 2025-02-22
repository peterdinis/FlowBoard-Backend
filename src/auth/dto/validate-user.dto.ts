import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
