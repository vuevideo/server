import { IsUUID, IsUrl } from 'class-validator';

export class UpdateProfileImageDto {
  @IsUrl(
    {},
    {
      message: 'Image URL is not a valid URL.',
    },
  )
  public imageLink: string;

  @IsUUID('4', {
    message: 'Image UUID is not a valid UUID.',
  })
  public storageUuid: string;
}
