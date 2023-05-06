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

  @Version('1')
  @Post()
  public async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Credentials> {
    await this.authService.checkAccountExistence(
      createAccountDto.emailAddress,
      createAccountDto.username,
    );

    const firebaseAccount = await this.firebaseService.auth.createUser({
      email: createAccountDto.emailAddress,
      password: createAccountDto.password,
      displayName: createAccountDto.name,
    });

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
    });
  }
}
