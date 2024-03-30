import { PrismaModule } from './../prisma/prisma.module';
import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { Accounts, Credentials, Prisma } from '@prisma/client';

const tCredentials: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
};

const tAccount: Accounts = {
  id: tCredentials.accountId,
  name: 'name',
  username: 'username',
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [AuthService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------GETONE()----------------------------
  describe('getOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should get one credential from db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsFindUniqueArgs = {
        where: {
          firebaseId: tCredentials.firebaseId,
        },
      };

      // Act
      const data = await service.getOne(query);

      // Assert
      expect(data).toBe(tCredentials);
      expect(prismaService.credentials.findUnique).toBeCalledWith(query);
    });

    it('should throw an error if record does not exist', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      const query: Prisma.CredentialsFindUniqueArgs = {
        where: {
          firebaseId: tCredentials.firebaseId,
        },
      };

      // Act
      service.getOne(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------CREATEONE()----------------------------
  describe('createOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should create one credential in db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.create.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsCreateArgs = {
        data: {
          firebaseId: 'firebaseId',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
      };

      // Act
      const data = await service.createOne(query);

      // Assert
      expect(data).toBe(tCredentials);
      expect(prismaService.credentials.create).toBeCalledWith(query);
    });

    it('should throw an error if record already exists', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsCreateArgs = {
        data: {
          firebaseId: 'firebaseId',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
      };

      // Act
      service.createOne(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/already exists/);
      });
    });
  });

  // ----------------------------UPDATEONE()----------------------------
  describe('updateOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should update one credential in db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      prismaService.credentials.update.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsUpdateArgs = {
        data: {
          firebaseId: 'firebaseId',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
        where: {
          firebaseId: 'firebaseId',
        },
      };

      // Act
      const data = await service.updateOne(query);

      // Assert
      expect(data).toBe(tCredentials);
      expect(prismaService.credentials.update).toBeCalledWith(query);
    });

    it('should throw an error if record does not exists', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsUpdateArgs = {
        data: {
          firebaseId: 'firebaseId',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
        where: {
          firebaseId: 'firebaseId',
        },
      };

      // Act
      service.updateOne(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------DELETEONE()----------------------------
  describe('deleteOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should delete one credential in db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      prismaService.credentials.delete.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsDeleteArgs = {
        where: {
          firebaseId: 'firebaseId',
        },
      };

      // Act
      const data = await service.deleteOne(query);

      // Assert
      expect(data).toBe(tCredentials);
      expect(prismaService.credentials.delete).toBeCalledWith(query);
    });

    it('should throw an error if record does not exists', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsDeleteArgs = {
        where: {
          firebaseId: 'firebaseId',
        },
      };

      // Act
      service.deleteOne(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------CHECKACCOUNTEXISTENCE()----------------------------
  describe('checkAccountExistence()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should throw an error if account exists for a given username', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.accounts.findUnique.mockResolvedValue(tAccount);

      // Act
      service
        .checkAccountExistence(tAccount.username)
        // Assert
        .catch((error) => {
          expect(error.toString()).toMatch(/username is already taken/);

          expect(prismaService.accounts.findUnique).toBeCalledWith({
            where: {
              username: tAccount.username,
            },
          });
        });
    });

    it('should pass for a given username', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.accounts.findUnique.mockResolvedValue(null);

      // Act
      await service.checkAccountExistence(tAccount.username);

      // Assert
      expect(prismaService.accounts.findUnique).toBeCalledWith({
        where: {
          username: tAccount.username,
        },
      });
    });
  });
});
