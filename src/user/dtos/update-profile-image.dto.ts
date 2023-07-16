import { IsUUID, IsUrl } from 'class-validator';

export class UpdateProfileImage {
  @IsUrl(
    {},
    {
      message: 'Image URL is not a valid URL.',
    },
  )
  public imageUrl: string;

  @IsUUID('4', {
    message: 'Image UUID is not a valid UUID.',
  })
  public imageUuid: string;
}
