import { FirebaseService } from './../firebase/firebase.service';
import { FirebaseModule } from './../firebase/firebase.module';
import { PrismaService } from './../prisma/prisma.service';
import { PrismaModule } from './../prisma/prisma.module';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { Credentials } from '@prisma/client';

const createUser = jest.fn();

const tCredentials: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  emailAddress: 'emailAddress',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
};

const tCredentialsWithAccount: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  emailAddress: 'emailAddress',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
};

const tDto: CreateAccountDto = {
  emailAddress: 'emailAddress',
  username: 'username',
  password: 'password',
  name: 'name',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, FirebaseModule],
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .overrideProvider(FirebaseService)
      .useValue({
        auth: {
          createUser,
        },
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should register a new account', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.create.mockResolvedValue(tCredentials);
      createUser.mockResolvedValue({ uid: 'uid' });

      // Act
      const result = await controller.createAccount(tDto);

      // Assert
      expect(result).toBe(tCredentials);
      expect(createUser).toBeCalledWith({
        email: tDto.emailAddress,
        password: tDto.password,
        displayName: tDto.name,
      });

      expect(prismaService.credentials.findUnique).toBeCalledWith({
        where: {
          username: tDto.username,
        },
      });

      expect(prismaService.credentials.findUnique).toBeCalledWith({
        where: {
          emailAddress: tDto.emailAddress,
        },
      });

      expect(prismaService.credentials.create).toBeCalledWith({
        data: {
          firebaseId: 'uid',
          emailAddress: 'emailAddress',
          account: {
            create: {
              username: 'username',
              name: 'name',
            },
          },
        },
      });
    });

    it('should throw an error for duplicate email usage', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);

      // Act
      const result = controller.createAccount(tDto);

      // Assert
      expect(result).rejects.toThrow(/email/);

      expect(prismaService.credentials.findUnique).toBeCalledWith({
        where: {
          emailAddress: tDto.emailAddress,
        },
      });
    });

    it('should throw an error for duplicate username usage', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);

      // Act
      const result = controller.createAccount(tDto);

      // Assert
      expect(result).rejects.toThrow(/username/);

      expect(prismaService.credentials.findUnique).toBeCalledWith({
        where: {
          username: tDto.username,
        },
      });
    });
  });
});
