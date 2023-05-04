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

  public async getOne(
    args: Prisma.CredentialsFindUniqueArgs,
  ): Promise<Credentials> {
    const credentials = await this.prismaService.credentials.findUnique(args);

    if (!credentials) {
      throw new NotFoundException('Credentials not found');
    }

    return credentials;
  }

  public async createOne(
    args: Prisma.CredentialsCreateArgs,
  ): Promise<Credentials> {
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.data.emailAddress,
      },
    });

    if (credentialsCheck) {
      throw new BadRequestException('Credentials already exists');
    }

    return await this.prismaService.credentials.create(args);
  }
  public async updateOne(
    args: Prisma.CredentialsUpdateArgs,
  ): Promise<Credentials> {
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.where.emailAddress,
      },
    });

    if (credentialsCheck) {
      throw new BadRequestException('Credentials already exists');
    }

    return await this.prismaService.credentials.update(args);
  }
  public async deleteOne(args: Prisma.CredentialsDeleteArgs) {
    const credentialsCheck = await this.prismaService.credentials.findUnique({
      where: {
        emailAddress: args.where.emailAddress,
      },
    });

    if (credentialsCheck) {
      throw new BadRequestException('Credentials already exists');
    }

    return await this.prismaService.credentials.delete(args);
  }
}
