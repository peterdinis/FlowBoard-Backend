import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mocked_token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        authService.validateUser({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return JWT token', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const result = await authService.login(mockUser);

      expect(result).toEqual({ access_token: 'mocked_token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const mockRegisterDto = {
        email: 'newuser@example.com',
        password: 'securepassword',
        name: 'John',
        lastName: 'Doe',
      };

      const mockCreatedUser = {
        id: 2,
        ...mockRegisterDto,
        password: await bcrypt.hash(mockRegisterDto.password, 10),
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockCreatedUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockCreatedUser.password);

      const result = await authService.register(mockRegisterDto);

      expect(result).toEqual(mockCreatedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterDto.email,
          password: expect.any(String), // Ensure password is hashed
          name: mockRegisterDto.name,
          lastName: mockRegisterDto.lastName,
        },
      });
    });
  });
});
