import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidatePayloadDto {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
