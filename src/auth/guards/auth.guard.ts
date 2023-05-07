import { FirebaseService } from './../../firebase/firebase.service';
import { AuthService } from './../auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Guard implementation for checking authentication.
   * @param context NestJS Execution Context
   * @returns Boolean to pass the guard or not.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtain request object from the context.
    const request = context.switchToHttp().getRequest();

    // Check if the token is syntactically valid.
    if (
      !(
        request.headers.authorization &&
        request.headers.authorization.split(' ')[0] === 'Bearer'
      )
    ) {
      throw new UnauthorizedException('Invalid Token');
    }

    try {
      // Get the actual firebase token and check against firebase.
      const authToken = request.headers.authorization.split(' ')[1];
      const firebaseUser = await this.firebaseService.auth.verifyIdToken(
        authToken,
      );

      // Set the user context in request.
      request.user = await this.authService.getOne({
        where: {
          firebaseId: firebaseUser.uid,
        },
      });

      // Return valid.
      return true;
    } catch (error) {
      if (error.code && error.code.startsWith('auth/')) {
        throw new UnauthorizedException('User is unauthorized');
      }

      console.log(error);

      throw new UnauthorizedException('Unauthorized');
    }
  }
}
