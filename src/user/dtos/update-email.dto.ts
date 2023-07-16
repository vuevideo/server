import { IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateEmailDto {
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
}
