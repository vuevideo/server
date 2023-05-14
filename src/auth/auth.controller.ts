import { FirebaseService } from './../firebase/firebase.service';
import { Credentials } from '@prisma/client';
import { CreateAccountDto } from './dtos/create-account.dto';
import { Body, Controller, Post, Version } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Controller Implementation for account registration.
   * @param createAccountDto DTO Implementation for account registration.
   * @returns Newly Created Credentials.
   */
  @Version('1')
  @Post()
  public async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Credentials> {
    // Check for existence of the account with the given username and email.
    await this.authService.checkAccountExistence(
      createAccountDto.emailAddress,
      createAccountDto.username,
    );

    // Create a new firebase account with the provided credentials.
    const firebaseAccount = await this.firebaseService.auth.createUser({
      email: createAccountDto.emailAddress,
      password: createAccountDto.password,
      displayName: createAccountDto.name,
    });

    // Create a new record in thje database and return it to the user.
    return await this.authService.createOne({
      data: {
        firebaseId: firebaseAccount.uid,
        emailAddress: createAccountDto.emailAddress,
        account: {
          create: {
            username: createAccountDto.username,
            name: createAccountDto.name,
          },
        },
      },
      include: {
        account: true,
      },
    });
  }
}
