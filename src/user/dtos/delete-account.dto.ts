import { IsNotEmpty, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @IsNotEmpty({
    message: 'Please enter a password.',
  })
  @MinLength(5, {
    message: 'Password should be at least 5 characters long.',
  })
  public password: string;
}
