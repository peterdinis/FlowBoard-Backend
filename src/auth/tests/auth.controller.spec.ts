import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register-dto';
import { ValidateUserDto } from '../dto/validate-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'securepassword',
        name: 'John',
        lastName: 'Doe',
      };

      const result = {
        id: '1',
        ...registerDto,
        createdAt: new Date(),
      };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(await authController.register(registerDto)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return a JWT token', async () => {
      const validateUserDto: ValidateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: "password123",
        createdAt: new Date(),
        name: "AAA",
        lastName: "BBB"
      };

      const mockJwtToken = { access_token: 'mocked_token' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockJwtToken);

      const result = await authController.login(validateUserDto);

      expect(result).toEqual(mockJwtToken);
      expect(authService.validateUser).toHaveBeenCalledWith(validateUserDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const validateUserDto: ValidateUserDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(validateUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile when JWT is valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockRequest = { user: mockUser };

      const result = await authController.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
