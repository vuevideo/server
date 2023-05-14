import { FirebaseError } from 'firebase-admin';
import { CreateAccountDto } from './dtos/create-account.dto';
import { FirebaseService } from './../firebase/firebase.service';
import { FirebaseModule } from './../firebase/firebase.module';
import { PrismaService } from './../prisma/prisma.service';
import { PrismaModule } from './../prisma/prisma.module';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { Accounts } from '@prisma/client';

const createUser = jest.fn();
const getUserByEmail = jest.fn();

class TNotFoundFirebaseError implements FirebaseError {
  code = 'auth/user-not-found';
  message = 'auth/user-not-found';
  stack?: string | undefined;
  toJSON(): object {
    return {};
  }
}

class TAlreadyExistsFirebaseError implements FirebaseError {
  code = 'auth/email-already-exists';
  message = 'auth/email-already-exists';
  stack?: string | undefined;
  toJSON(): object {
    return {};
  }
}

const tAccount: Accounts = {
  id: 'accountId',
  name: 'name',
  username: 'username',
};

const tCredentials: any = {
  id: 'id',
  firebaseId: 'firebaseId',
  emailAddress: 'emailAddress',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
  account: tAccount,
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
          getUserByEmail,
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
      prismaService.accounts.findUnique.mockResolvedValue(null);
      prismaService.credentials.create.mockResolvedValue(tCredentials);
      createUser.mockResolvedValue({ uid: 'uid' });
      const serviceCheckSpy = jest.spyOn(service, 'checkAccountExistence');
      const serviceCreateSpy = jest.spyOn(service, 'createOne');

      // Act
      const result = await controller.createAccount(tDto);

      // Assert
      expect(result).toBe(tCredentials);
      expect(createUser).toBeCalledWith({
        email: tDto.emailAddress,
        password: tDto.password,
        displayName: tDto.name,
      });

      expect(serviceCheckSpy).toBeCalledWith(tDto.emailAddress, tDto.username);

      expect(serviceCreateSpy).toBeCalledWith({
        data: {
          firebaseId: 'uid',
          emailAddress: tDto.emailAddress,
          account: {
            create: {
              username: tDto.username,
              name: tDto.name,
            },
          },
        },
        include: {
          account: true,
        },
      });
    });

    it('should throw an error for duplicate email usage on database end', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      prismaService.accounts.findUnique.mockResolvedValue(null);
      const serviceCheckSpy = jest.spyOn(service, 'checkAccountExistence');

      // Act
      controller.createAccount(tDto).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/email/);

        expect(serviceCheckSpy).toBeCalledWith(
          tDto.emailAddress,
          tDto.username,
        );
      });
    });

    it('should throw an error for duplicate email usage on firebase end', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.accounts.findUnique.mockResolvedValue(null);
      getUserByEmail.mockResolvedValue({ uid: 'uid' });
      createUser.mockRejectedValue(new TAlreadyExistsFirebaseError());
      const serviceCheckSpy = jest.spyOn(service, 'checkAccountExistence');

      // Act
      controller.createAccount(tDto).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/email/);

        expect(serviceCheckSpy).toBeCalledWith(
          tDto.emailAddress,
          tDto.username,
        );
      });
    });

    it('should throw an error for duplicate username', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.accounts.findUnique.mockResolvedValue(tAccount);
      const serviceCheckSpy = jest.spyOn(service, 'checkAccountExistence');
      // Act
      controller.createAccount(tDto).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/username/);

        expect(serviceCheckSpy).toBeCalledWith(
          tDto.emailAddress,
          tDto.username,
        );
      });
    });
  });
});
