import { PrismaModule } from './../prisma/prisma.module';
import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { Credentials, Prisma } from '@prisma/client';
import { HttpException } from '@nestjs/common';

const tCredentials: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  emailAddress: 'emailAddress',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
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
          emailAddress: tCredentials.emailAddress,
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
          emailAddress: tCredentials.emailAddress,
        },
      };

      // Act
      const result = service.getOne(query);

      // Assert
      expect(result).rejects.toThrowError(HttpException);
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
          emailAddress: 'emailAddress',
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
          emailAddress: 'emailAddress',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
      };

      // Act
      const result = service.createOne(query);

      // Assert
      expect(result).rejects.toThrowError(HttpException);
    });
  });

  // ----------------------------UPDATEONE()----------------------------
  describe('updateOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should update one credential in db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.update.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsUpdateArgs = {
        data: {
          firebaseId: 'firebaseId',
          emailAddress: 'emailAddress',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
        where: {
          emailAddress: 'emailAddress',
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
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsUpdateArgs = {
        data: {
          firebaseId: 'firebaseId',
          emailAddress: 'emailAddress',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: 'accountId',
        },
        where: {
          emailAddress: 'emailAddress',
        },
      };

      // Act
      const result = service.updateOne(query);

      // Assert
      expect(result).rejects.toThrowError(HttpException);
    });
  });

  // ----------------------------DELETEONE()----------------------------
  describe('deleteOne()', () => {
    beforeEach(() => {
      mockReset(prismaService);
    });

    it('should delete one credential in db', async () => {
      // Arrange
      prismaService.credentials.findUnique.mockResolvedValue(null);
      prismaService.credentials.delete.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsDeleteArgs = {
        where: {
          emailAddress: 'emailAddress',
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
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);
      const query: Prisma.CredentialsDeleteArgs = {
        where: {
          emailAddress: 'emailAddress',
        },
      };

      // Act
      const result = service.deleteOne(query);

      // Assert
      expect(result).rejects.toThrowError(HttpException);
    });
  });
});
