import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, FirebaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
