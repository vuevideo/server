import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({
    message: 'Please enter a username.',
  })
  @MinLength(5, {
    message: 'Username should be at least 5 characters long.',
  })
  public username: string;

  @IsNotEmpty({
    message: 'Please enter a name.',
  })
  @MinLength(5, {
    message: 'Name should be at least 5 characters long.',
  })
  public name: string;
}
