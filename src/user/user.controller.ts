import { AuthGuard } from './../auth/guards/auth.guard';
import { AuthService } from './../auth/auth.service';
import {
  Controller,
  Version,
  Get,
  Put,
  Delete,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Accounts, Credentials, ProfileImage } from '@prisma/client';
import { User } from './../decorators/user.decorator';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { UpdateProfileImageDto } from './dtos/update-profile-image.dto';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Controller Implementation for getting full user account.
   * @param credentials Logged In User
   * @returns Full User Account
   */
  @Version('1')
  @Get()
  public async getUser(@User() credentials: Credentials): Promise<Credentials> {
    // Fetching user details for the database
    // and returning it.
    return await this.authService.getOne({
      where: {
        id: credentials.id,
      },
      include: {
        account: {
          include: {
            image: true,
          },
        },
      },
    });
  }

  /**
   * Controller Implementation for updating account.
   * @param updateUserDto DTO Implementation for updating account.
   * @param credentials Logged In User
   * @returns Updated Account.
   */
  @Version('1')
  @Put()
  public async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User() credentials: Credentials,
  ): Promise<Accounts> {
    // Fetch existing details
    const credentialsAccount: any = await this.authService.getOne({
      where: {
        id: credentials.id,
      },
      include: {
        account: true,
      },
    });

    // Check if username has changed.
    if (credentialsAccount.account.username !== updateUserDto.username) {
      // Check if new username is available.
      const usernameCheck = await this.userService.findOneByUsername(
        updateUserDto.username,
      );

      // If user with that username already exists, throw an HTTP Exception.
      if (usernameCheck) {
        throw new BadRequestException('User with that username already exists');
      }

      // Update user details
      return await this.userService.updateUser({
        where: {
          id: credentials.accountId,
        },
        data: {
          ...updateUserDto,
        },
      });
    } else {
      // Update user details
      return await this.userService.updateUser({
        where: {
          id: credentials.accountId,
        },
        data: {
          name: updateUserDto.name,
        },
      });
    }
  }

  /**
   * Controller Implementation for Email Update.
   * @param updateEmailDto DTO implementation for Email Address
   * @param credentials Logged In User Credentials
   * @returns Updated Credentials
   */
  @Version('1')
  @Put('email')
  public async updateEmailAddress(
    @Body() updateEmailDto: UpdateEmailDto,
    @User() credentials: Credentials,
  ): Promise<Credentials> {
    // Check if any other account has the same email address
    const emailCheck = await this.userService.fineOneByEmailAddress({
      where: {
        emailAddress: updateEmailDto.emailAddress,
      },
    });

    // Throw an HTTP Exception if the email address already used.
    if (emailCheck) {
      throw new BadRequestException(
        'User with that email address already exists',
      );
    }

    // Update and return the updated credentials.
    return await this.userService.updateEmailAddress({
      where: {
        id: credentials.id,
      },
      data: {
        emailAddress: updateEmailDto.emailAddress,
      },
    });
  }

  /**
   * Create or Update Profile Image Controller Implementation.
   * @param updateProfileImageDto DTO implementation for Profile Image Update.
   * @param credentials Logged In User Credentials.
   * @returns ProfileImage Object
   */
  @Version('1')
  @Put('profile-image')
  public async updateProfileImage(
    @Body() updateProfileImageDto: UpdateProfileImageDto,
    @User() credentials: Credentials,
  ): Promise<ProfileImage> {
    // Check if profile image already exists or not.
    const profileImage = await this.userService.findProfileImageByUser(
      credentials.id,
    );

    if (profileImage) {
      // Update profile image and return it.
      return await this.userService.updateProfileImage({
        where: {
          accountId: profileImage.accountId,
        },
        data: {
          ...updateProfileImageDto,
        },
      });
    } else {
      // Fetch existing details
      const credentialsAccount: any = await this.authService.getOne({
        where: {
          id: credentials.id,
        },
        include: {
          account: true,
        },
      });

      // Create new profile image record and return it.
      return await this.userService.createProfileImage({
        data: {
          ...updateProfileImageDto,
          account: {
            connect: {
              id: credentialsAccount.account.id,
            },
          },
        },
      });
    }
  }

  /**
   * Controller Implementation for deleting account.
   * @param credentials Logged iun user credentials.
   * @returns Deleted Account.
   */
  @Version('1')
  @Delete()
  public async deleteAccount(@User() credentials: Credentials) {
    // Fetch existing details
    const credentialsAccount: any = await this.authService.getOne({
      where: {
        id: credentials.id,
      },
      include: {
        account: true,
      },
    });

    // Delete the account and return it.
    return await this.userService.deleteAccount({
      where: {
        id: credentialsAccount.account.id,
      },
    });
  }
}
