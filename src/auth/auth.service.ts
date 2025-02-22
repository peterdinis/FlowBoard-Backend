import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { RegisterDto } from './dto/register-dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(validateUserDto: ValidateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: validateUserDto.email },
    });
    if (
      !user ||
      !(await bcrypt.compare(validateUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: LoginUserDto) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        lastName: registerDto.lastName,
      },
    });
  }
}
