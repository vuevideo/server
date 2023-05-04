import { Credentials, Prisma } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Query the database to fetch one credentials object.
   * @param args Prisma Find Unique Args
   * @returns Credentials
   * @throws NotFoundException
   */
  public async getOne(
    args: Prisma.CredentialsFindUniqueArgs,
  ): Promise<Credentials> {
    // Check for credentials in the database.
    const credentials = await this.prismaService.credentials.findUnique(args);

    // Check if the credentials is not null.
    if (!credentials) {
      throw new NotFoundException('Credentials not found');
    }

    // Return if credentials exist.
    return credentials;
  }

  /**
   * Query the database to create one credentials object.
   * @param args Prisma Create Args
   * @returns Credentials
   * @throws BadRequestException
   */
  public async createOne(
    args: Prisma.CredentialsCreateArgs,
  ): Promise<Credentials> {
    // Check for credentials in the database.
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.data.emailAddress,
      },
    });

    // Check if the credentials already exists.
    if (credentialsCheck) {
      throw new BadRequestException('Credentials already exists');
    }

    // Create credentials and return the same.
    return await this.prismaService.credentials.create(args);
  }

  /**
   * Query the database to update one credentials object.
   * @param args Prisma Update Args
   * @returns Credentials
   * @throws NotFoundException
   */
  public async updateOne(
    args: Prisma.CredentialsUpdateArgs,
  ): Promise<Credentials> {
    // Check for credentials in the database.
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.where.emailAddress,
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
   * Query the database to delete one credentials object.
   * @param args Prisma Delete Args
   * @returns Credentials
   * @throws NotFoundException
   */
  public async deleteOne(args: Prisma.CredentialsDeleteArgs) {
    // Check for credentials in the database.
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.where.emailAddress,
      },
    });

    // Check if the credentials is not null.
    if (!credentialsCheck) {
      throw new NotFoundException('Credentials not found');
    }

    // Delete the credentials.
    return await this.prismaService.credentials.delete(args);
  }
}
