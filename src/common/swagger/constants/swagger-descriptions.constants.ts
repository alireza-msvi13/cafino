import { AllowdImageFormats } from 'src/common/constants/image-mime-type.constant';

export const SwaggerSharedDescriptions = {
  Pagination: `
  - Pagination:
    - limit:
      - Optional.
      - Must be an integer.
      - Minimum: 1, Maximum: 100
      - Default: 10
    - page:
      - Optional.
      - Must be an integer.
      - Minimum: 1
      - Default: 1
  `,
  Image: `
- image:
    - Must be provided as binary file (jpg, png, ...).
    - Max file size = 5 MB.
    - Only allowed formats: ${AllowdImageFormats.join(', ')}.
  `,
  Images: ` 
- images: 
  - Optional.
  - Can upload up to 5 files.
  - Each file max size = 5 MB.
  - Allowed formats: ${AllowdImageFormats.join(', ')}.`,
  UUID: `
- id:
  - Must not be empty.
  - Must be a valid id (UUID v4).
  `,
};
