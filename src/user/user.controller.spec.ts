import { AuthService } from './../auth/auth.service';
import { FirebaseService } from './../firebase/firebase.service';
import { PrismaService } from './../prisma/prisma.service';
import { AuthModule } from './../auth/auth.module';
import { PrismaModule } from './../prisma/prisma.module';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Accounts, ProfileImage } from '@prisma/client';
import { UserService } from './user.service';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { FirebaseModule } from '../firebase/firebase.module';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { UpdateProfileImageDto } from './dtos/update-profile-image.dto';

const createUser = jest.fn();
const getUserByEmail = jest.fn();

const tAccount: Accounts = {
  id: 'accountId',
  name: 'name',
  username: 'username',
};

const tUpdatedAccount: Accounts = {
  id: 'accountId',
  name: 'updatedname',
  username: 'updateduser',
};

const tUpdatedNameAccount: Accounts = {
  id: 'accountId',
  name: 'name',
  username: 'updateduser',
};

const tAnotherAccount: Accounts = {
  id: 'accountId',
  name: 'Anothername',
  username: 'Anotheruser',
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

const tCredentialsInvalid: any = {
  id: 'invalidid',
  firebaseId: 'invalidfirebaseId',
  emailAddress: 'invalidemailAddress',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'invalidaccountId',
  account: null,
};

const tProfileImage: ProfileImage = {
  accountId: tAccount.id,
  id: 'id',
  imageLink: 'imageLink',
  storageUuid: 'storageUuid',
};
describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let authService: AuthService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
      imports: [PrismaModule, AuthModule, FirebaseModule],
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

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(authService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  // ----------------------------UPDATEUSER()----------------------------

  describe('updateUser()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('updates the user', async () => {
      // Arrange
      prisma.credentials.findUnique.mockResolvedValue(tCredentials);
      const authServiceSpy = jest.spyOn(authService, 'getOne');
      const usernameSpy = jest.spyOn(service, 'findOneByUsername');
      const updateSpy = jest.spyOn(service, 'updateUser');
      prisma.accounts.findFirst.mockResolvedValue(null);
      prisma.accounts.findUnique.mockResolvedValue(tAccount);
      prisma.accounts.update.mockResolvedValue(tUpdatedAccount);
      const dto: UpdateUserDto = {
        name: 'updatedname',
        username: 'updateduser',
      };

      // Act
      const result = await controller.updateUser(dto, tCredentials);

      // Assert
      expect(result).toBe(tUpdatedAccount);
      expect(updateSpy).toBeCalledWith({
        where: {
          id: tCredentials.accountId,
        },
        data: {
          ...dto,
        },
      });
      expect(usernameSpy).toBeCalledWith(dto.username);
      expect(authServiceSpy).toBeCalledWith({
        where: {
          id: tCredentials.id,
        },
        include: {
          account: true,
        },
      });
    });

    it('updates the name only', async () => {
      // Arrange
      prisma.credentials.findUnique.mockResolvedValue(tCredentials);
      const authServiceSpy = jest.spyOn(authService, 'getOne');
      const usernameSpy = jest.spyOn(service, 'findOneByUsername');
      const updateSpy = jest.spyOn(service, 'updateUser');
      prisma.accounts.findFirst.mockResolvedValue(null);
      prisma.accounts.findUnique.mockResolvedValue(tAccount);
      prisma.accounts.update.mockResolvedValue(tUpdatedNameAccount);
      const dto: UpdateUserDto = {
        name: 'updatedname',
        username: tAccount.username,
      };

      // Act
      const result = await controller.updateUser(dto, tCredentials);

      // Assert
      expect(result).toBe(tUpdatedNameAccount);
      expect(updateSpy).toBeCalledWith({
        where: {
          id: tCredentials.accountId,
        },
        data: {
          name: dto.name,
        },
      });
      expect(usernameSpy).toBeCalledTimes(0);
      expect(authServiceSpy).toBeCalledWith({
        where: {
          id: tCredentials.id,
        },
        include: {
          account: true,
        },
      });
    });

    it('throws an error for existing account', async () => {
      // Arrange
      prisma.credentials.findUnique.mockResolvedValue(tCredentials);
      const authServiceSpy = jest.spyOn(authService, 'getOne');
      const usernameSpy = jest.spyOn(service, 'findOneByUsername');
      prisma.accounts.findFirst.mockResolvedValue(tAnotherAccount);
      const dto: UpdateUserDto = {
        name: 'updatedname',
        username: tAnotherAccount.username,
      };

      // Act
      await controller.updateUser(dto, tCredentials).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/already exists/);
        expect(usernameSpy).toBeCalledWith(dto.username);
        expect(authServiceSpy).toBeCalledWith({
          where: {
            id: tCredentials.id,
          },
          include: {
            account: true,
          },
        });
      });
    });
  });

  // ----------------------------UPDATEEMAILADDRESS()----------------------------
  describe('updateEmailAddress()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('updates email of the user', async () => {
      // Arrange
      const emailSpy = jest.spyOn(service, 'fineOneByEmailAddress');
      const updateSpy = jest.spyOn(service, 'updateEmailAddress');
      prisma.credentials.findUnique.mockResolvedValue(null);
      prisma.credentials.findFirst.mockResolvedValue(tCredentials);
      prisma.credentials.update.mockResolvedValue(tCredentials);

      const dto: UpdateEmailDto = {
        emailAddress: tCredentials.emailAddress,
      };

      // Act
      const result = await controller.updateEmailAddress(dto, tCredentials);

      // Assert
      expect(result).toBe(tCredentials);
      expect(updateSpy).toBeCalledWith({
        where: {
          id: tCredentials.id,
        },
        data: {
          ...dto,
        },
      });
      expect(emailSpy).toBeCalledWith({
        where: {
          emailAddress: dto.emailAddress,
        },
      });
    });
  });

  it('throws an error for duplicate email address', async () => {
    // Arrange
    const emailSpy = jest.spyOn(service, 'fineOneByEmailAddress');
    prisma.credentials.findUnique.mockResolvedValue(tCredentials);

    const dto: UpdateEmailDto = {
      emailAddress: tCredentials.emailAddress,
    };

    // Act
    await controller.updateEmailAddress(dto, tCredentials).catch((error) => {
      // Assert
      expect(error.toString()).toMatch(/already exists/);
      expect(emailSpy).toBeCalledWith({
        where: {
          emailAddress: dto.emailAddress,
        },
      });
    });
  });

  // ----------------------------UPDATEPROFILEIMAGE()----------------------------
  describe('updateProfileImage()', () => {
    beforeEach(() => {
      mockReset(prisma);
    });

    it('should create new profile image', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(tAccount);
      prisma.profileImage.findFirst.mockResolvedValue(null);
      prisma.credentials.findUnique.mockResolvedValue(tCredentials);
      prisma.profileImage.create.mockResolvedValue(tProfileImage);
      const findImageSpy = jest.spyOn(service, 'findProfileImageByUser');
      const authSpy = jest.spyOn(authService, 'getOne');

      const dto: UpdateProfileImageDto = {
        imageLink: 'imagelink',
        storageUuid: 'storageuuid',
      };

      // Act
      const result = await controller.updateProfileImage(dto, tCredentials);

      // Assert
      expect(result).toBe(tProfileImage);
      expect(findImageSpy).toBeCalledWith(tCredentials.id);
      expect(authSpy).toBeCalledWith({
        where: {
          id: tCredentials.id,
        },
        include: {
          account: true,
        },
      });
    });

    it('should update profile image', async () => {
      // Arrange
      prisma.accounts.findFirst.mockResolvedValue(tAccount);
      prisma.profileImage.findFirst.mockResolvedValue(tProfileImage);
      prisma.credentials.findUnique.mockResolvedValue(tCredentials);
      prisma.profileImage.update.mockResolvedValue(tProfileImage);
      prisma.profileImage.findUnique.mockResolvedValue(tProfileImage);
      const findImageSpy = jest.spyOn(service, 'findProfileImageByUser');
      const authSpy = jest.spyOn(authService, 'getOne');

      const dto: UpdateProfileImageDto = {
        imageLink: 'imagelink',
        storageUuid: 'storageuuid',
      };

      // Act
      const result = await controller.updateProfileImage(dto, tCredentials);

      // Assert
      expect(result).toBe(tProfileImage);
      expect(findImageSpy).toBeCalledWith(tCredentials.id);
      expect(authSpy).toBeCalledTimes(0);
    });
  });
});
