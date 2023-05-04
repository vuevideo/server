import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({
    message: 'Please enter an email address.',
  })
  @IsEmail(
    {},
    {
      message: 'Please enter a valid email address.',
    },
  )
  public emailAddress: string;

  @IsNotEmpty({
    message: 'Please enter a username.',
  })
  @MinLength(5, {
    message: 'Username should be at least 5 characters long.',
  })
  public username: string;

  @IsNotEmpty({
    message: 'Please enter a password.',
  })
  @MinLength(5, {
    message: 'Password should be at least 5 characters long.',
  })
  public password: string;

  @IsNotEmpty({
    message: 'Please enter a name.',
  })
  @MinLength(5, {
    message: 'Name should be at least 5 characters long.',
  })
  public name: string;
}
