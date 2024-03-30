import { PrismaModule } from './../prisma/prisma.module';
import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { Accounts, Credentials, ProfileImage, Prisma } from '@prisma/client';

const tCredentials: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
};

const tUpdatedCredentials: Credentials = {
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

const tProfileImage: ProfileImage = {
  accountId: tAccount.id,
  id: 'id',
  imageLink: 'imageLink',
  storageUuid: 'storageUuid',
};

describe('UserService', () => {
  let service: UserService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UserService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  // ----------------------------FINDONEBYUSERNAME()----------------------------

  describe('findOneByUsername()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should get one account from db using username', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(tAccount);

      // Act
      const result = await service.findOneByUsername(tAccount.username);

      // Assert
      expect(result).toBe(tAccount);
      expect(prisma.accounts.findFirst).toBeCalledWith({
        where: {
          username: tAccount.username,
        },
      });
    });

    it('should get return null from db using username', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.findOneByUsername('doesnotexist');

      // Assert
      expect(result).toBe(null);
      expect(prisma.accounts.findFirst).toBeCalledWith({
        where: {
          username: 'doesnotexist',
        },
      });
    });
  });

  // ----------------------------FINDPROFILEIMAGEBYUSER()----------------------------
  describe('findProfileImageByUser()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should return one profile image from credentials id', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(tAccount);
      prisma.profileImage.findFirst.mockResolvedValue(tProfileImage);

      // Act
      const image = await service.findProfileImageByUser(tCredentials.id);

      // Assert
      expect(image).toBe(tProfileImage);
      expect(prisma.accounts.findFirst).toBeCalledWith({
        where: {
          Credentials: {
            id: tCredentials.id,
          },
        },
      });
      expect(prisma.profileImage.findFirst).toBeCalledWith({
        where: {
          accountId: tAccount.id,
        },
      });
    });

    it('should return null from credentials id', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(tAccount);
      prisma.profileImage.findFirst.mockResolvedValue(null);

      // Act
      const image = await service.findProfileImageByUser(tCredentials.id);

      // Assert
      expect(image).toBe(null);
      expect(prisma.accounts.findFirst).toBeCalledWith({
        where: {
          Credentials: {
            id: tCredentials.id,
          },
        },
      });
      expect(prisma.profileImage.findFirst).toBeCalledWith({
        where: {
          accountId: tAccount.id,
        },
      });
    });

    it('should return error from invalid credentials id', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(null);

      // Act
      service.findProfileImageByUser('invalidid').catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------CREATEPROFILEIMAGE()----------------------------
  describe('createProfileImage()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should create one profile image in db', async () => {
      // Arrange
      prisma.profileImage.findUnique.mockResolvedValue(null);
      prisma.profileImage.create.mockResolvedValue(tProfileImage);
      const query: Prisma.ProfileImageCreateArgs = {
        data: {
          accountId: tAccount.id,
          imageLink: tProfileImage.imageLink,
          storageUuid: tProfileImage.storageUuid,
        },
      };

      // Act
      const data = await service.createProfileImage(query);

      // Assert
      expect(data).toBe(tProfileImage);
      expect(prisma.profileImage.create).toBeCalledWith(query);
    });

    it('should throw an error if record already exists', async () => {
      // Arrange
      prisma.profileImage.findUnique.mockResolvedValue(tProfileImage);
      const query: Prisma.ProfileImageCreateArgs = {
        data: {
          accountId: tAccount.id,
          imageLink: tProfileImage.imageLink,
          storageUuid: tProfileImage.storageUuid,
        },
      };

      // Act
      service.createProfileImage(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/already exists/);
      });
    });
  });

  // ----------------------------UPDATEUSER()----------------------------
  describe('updateUser()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should update one account in db', async () => {
      // Arrange
      prisma.accounts.findUnique.mockResolvedValue(tAccount);
      prisma.accounts.update.mockResolvedValue(tAccount);
      const query: Prisma.AccountsUpdateArgs = {
        data: {
          name: 'updatedname',
          username: 'updatedusername',
        },
        where: {
          id: tAccount.id,
        },
      };

      // Act
      const data = await service.updateUser(query);

      // Assert
      expect(data).toBe(tAccount);
      expect(prisma.accounts.update).toBeCalledWith(query);
    });

    it('should throw an error if record does not exists', async () => {
      // Arrange
      prisma.accounts.findUnique.mockResolvedValue(null);
      prisma.accounts.findUnique.mockResolvedValue(tAccount);
      const query: Prisma.AccountsUpdateArgs = {
        data: {
          name: 'updatedname',
          username: 'updatedusername',
        },
        where: {
          id: 'invalidid',
        },
      };

      // Act
      service.updateUser(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------UPDATEPROFILEIMAGE()----------------------------
  describe('updateProfileImage()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should update one profile image in db', async () => {
      // Arrange
      prisma.profileImage.findUnique.mockResolvedValue(tProfileImage);
      prisma.profileImage.update.mockResolvedValue(tProfileImage);
      const query: Prisma.ProfileImageUpdateArgs = {
        data: {
          imageLink: 'imagelink',
          storageUuid: 'uuid',
        },
        where: {
          accountId: tAccount.id,
        },
      };

      // Act
      const data = await service.updateProfileImage(query);

      // Assert
      expect(data).toBe(tProfileImage);
      expect(prisma.profileImage.update).toBeCalledWith(query);
    });

    it('should throw an error if record does not exists', async () => {
      // Arrange
      prisma.profileImage.findUnique.mockResolvedValue(null);
      const query: Prisma.ProfileImageUpdateArgs = {
        data: {
          imageLink: 'imagelink',
          storageUuid: 'uuid',
        },
        where: {
          accountId: tAccount.id,
        },
      };

      // Act
      service.updateProfileImage(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });

  // ----------------------------DELETEACCOUNT()----------------------------

  describe('deleteAccount()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should delete one accounts in db', async () => {
      // Arrange
      prisma.accounts.findUnique.mockResolvedValue(tAccount);
      prisma.accounts.delete.mockResolvedValue(tAccount);
      const query: Prisma.AccountsDeleteArgs = {
        where: {
          id: tAccount.id,
        },
      };

      // Act
      const result = await service.deleteAccount(query);

      // Assert
      expect(result).toBe(tAccount);
      expect(prisma.accounts.delete).toBeCalledWith(query);
    });

    it('should throw an error if record does not exists', async () => {
      // Arrange
      prisma.credentials.findUnique.mockResolvedValue(null);
      const query: Prisma.AccountsDeleteArgs = {
        where: {
          id: tAccount.id,
        },
      };

      // Act
      service.deleteAccount(query).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/not found/);
      });
    });
  });
});
