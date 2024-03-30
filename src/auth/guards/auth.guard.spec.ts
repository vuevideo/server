import { FirebaseService } from './../../firebase/firebase.service';
import { PrismaService } from './../../prisma/prisma.service';
import { FirebaseModule } from './../../firebase/firebase.module';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { PrismaModule } from './../../prisma/prisma.module';
import { AuthModule } from '../auth.module';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { AuthService } from '../auth.service';
import { Credentials } from '@prisma/client';
import { FirebaseError } from 'firebase-admin';
import {
  ExecutionContextMock,
  buildExecutionContextMock,
} from './../../../mocks/execution-context.mock';

const verifyIdToken = jest.fn();

const tCorrectToken = 'Bearer testtoken123';
const tWrongToken = 'Bearer wrongtoken123';
const tInvalidToken = 'testtoken123';

const tCredentials: Credentials = {
  id: 'id',
  firebaseId: 'firebaseId',
  createdAt: new Date(),
  updatedAt: new Date(),
  accountId: 'accountId',
};

class TError implements FirebaseError {
  code = 'auth/error';
  message: string;
  stack?: string | undefined;
  toJSON(): object {
    return {};
  }
}

describe('AuthGuard', () => {
  let authService: AuthService;
  let firebaseService: FirebaseService;
  let prismaService: DeepMockProxy<PrismaService>;

  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, FirebaseModule, AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .overrideProvider(FirebaseService)
      .useValue({
        auth: {
          verifyIdToken,
        },
      })
      .compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    firebaseService = module.get<FirebaseService>(FirebaseService);

    guard = new AuthGuard(authService, firebaseService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate()', () => {
    let mockExecutionContext: ExecutionContextMock;

    beforeEach(() => {
      mockExecutionContext = buildExecutionContextMock();
    });

    it('should pass the authentication guard', async () => {
      // Arrange
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: () => ({
          headers: {
            authorization: tCorrectToken,
          },
          user: null,
        }),
      });
      verifyIdToken.mockResolvedValue({
        uid: tCredentials.firebaseId,
      });
      const serviceSpy = jest.spyOn(authService, 'getOne');
      prismaService.credentials.findUnique.mockResolvedValue(tCredentials);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(verifyIdToken).toBeCalledWith(tCorrectToken.split(' ')[1]);
      expect(serviceSpy).toBeCalledWith({
        where: {
          firebaseId: tCredentials.firebaseId,
        },
      });
    });

    it('should fail the authentication guard for incorrect token', async () => {
      // Arrange
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: () => ({
          headers: {
            authorization: tWrongToken,
          },
          user: null,
        }),
      });

      verifyIdToken.mockRejectedValue(new TError());

      // Act
      guard.canActivate(mockExecutionContext).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/unauthorized/);
        expect(verifyIdToken).toBeCalledWith(tWrongToken.split(' ')[1]);
      });
    });

    it('should fail the authentication guard for invalid token', async () => {
      // Arrange
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: () => ({
          headers: {
            authorization: tInvalidToken,
          },
          user: null,
        }),
      });

      // Act
      guard.canActivate(mockExecutionContext).catch((error) => {
        // Assert
        expect(error.toString()).toMatch(/Invalid/);
      });
    });
  });
});
