import { Accounts, ProfileImage, Prisma, Credentials } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Find one account by username.
   * @param username Account with username to find.
   * @returns Account with the specified username.
   */
  public async findOneByUsername(username: string): Promise<Accounts | null> {
    return await this.prismaService.accounts.findFirst({
      where: {
        username,
      },
    });
  }

  /**
   * Query the database to fetch one credentials object by email.
   * @param args Prisma Find Unique Args
   * @returns Credentials
   * @throws NotFoundException
   */
  public async fineOneByEmailAddress(
    args: Prisma.CredentialsFindUniqueArgs,
  ): Promise<Credentials | null> {
    return await this.prismaService.credentials.findUnique(args);
  }

  /**
   * Find a profile image to the corresponding user.
   * @param credentialsId Credentials ID.
   * @returns Profile Image object or null if not found.
   * @throws NotFoundException
   */
  public async findProfileImageByUser(
    credentialsId: string,
  ): Promise<ProfileImage | null> {
    const account = await this.prismaService.accounts.findFirst({
      where: {
        Credentials: {
          id: credentialsId,
        },
      },
    });

    if (account === null) {
      throw new NotFoundException('User not found for the given ID');
    }

    return await this.prismaService.profileImage.findFirst({
      where: {
        accountId: account.id,
      },
    });
  }

  /**
   * Query the database to create one profile image object.
   * @param args Prisma Create Args
   * @returns ProfileImage
   * @throws BadRequestException
   */
  public async createProfileImage(
    args: Prisma.ProfileImageCreateArgs,
  ): Promise<ProfileImage> {
    // Check for profile image in the database.
    const credentialsCheck = await this.prismaService.profileImage.findUnique({
      where: {
        accountId: args.data.accountId,
      },
    });

    // Check if the profile image already exists.
    if (credentialsCheck) {
      throw new BadRequestException('Profile Image already exists');
    }

    // Create profile image and return the same.
    return await this.prismaService.profileImage.create(args);
  }

  /**
   * Query the database to update one accounts object.
   * @param args Prisma Update Args
   * @returns Accounts
   * @throws NotFoundException
   */
  public async updateUser(args: Prisma.AccountsUpdateArgs): Promise<Accounts> {
    // Check for account in the database.
    const accountsCheck = await this.prismaService.accounts.findUnique({
      where: {
        id: args.where.id,
      },
    });

    // Check if the accounts is not null.
    if (!accountsCheck) {
      throw new NotFoundException('Account not found');
    }

    // Update and return the updated account.
    return await this.prismaService.accounts.update(args);
  }

  /**
   * Query the database to update email address.
   * @param args Prisma Update Args
   * @returns Credentials
   * @throws NotFoundException
   */
  public async updateEmailAddress(
    args: Prisma.CredentialsUpdateArgs,
  ): Promise<Credentials> {
    // Check for credentials in the database.
    const credentialsCheck = await this.prismaService.credentials.findFirst({
      where: {
        id: args.where.id,
      },
    });

    // Check if the credentials is not null.
    if (!credentialsCheck) {
      throw new NotFoundException('Credentials not found');
    }

    // Update and return the updated credentials.
    return await this.prismaService.credentials.update(args);
  }

  /**
   * Query the database to update one profile picture object.
   * @param args Prisma Update Args
   * @returns ProfileImage
   * @throws NotFoundException
   */
  public async updateProfileImage(
    args: Prisma.ProfileImageUpdateArgs,
  ): Promise<ProfileImage> {
    // Check for profile image in the database.
    const profileImageCheck = await this.prismaService.profileImage.findUnique({
      where: {
        accountId: args.where.id,
      },
    });

    // Check if the profile image is not null.
    if (!profileImageCheck) {
      throw new NotFoundException('Profile Image not found');
    }

    // Update and return the updated profile image.
    return await this.prismaService.profileImage.update(args);
  }

  /**
   * Query the database to delete one accounts object.
   * @param args Prisma Delete Args
   * @returns Account
   * @throws NotFoundException
   */
  public async deleteAccount(args: Prisma.AccountsDeleteArgs) {
    // Check for accounts in the database.
    const accountsCheck = await this.prismaService.accounts.findUnique({
      where: {
        id: args.where.id,
      },
    });

    // Check if the accounts is not null.
    if (!accountsCheck) {
      throw new NotFoundException('Account not found');
    }

    // Delete the account.
    return await this.prismaService.accounts.delete(args);
  }
}
