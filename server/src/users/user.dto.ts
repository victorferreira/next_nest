import { IsString, IsEmail, IsPhoneNumber, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('US')
  phone: string;

  @IsUrl()
  website: string;
}

export class UpdateUserDto {
  @IsString()
  id: string;

  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsPhoneNumber('US')
  phone?: string;

  @IsUrl()
  website?: string;
}
