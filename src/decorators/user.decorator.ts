import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Credentials } from '@prisma/client';

/**
 * Fetches the currently logged in user
 * from the request context.
 */
export const User = createParamDecorator<Credentials>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
