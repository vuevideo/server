import { Injectable, OnModuleInit } from '@nestjs/common';
import { App, initializeApp, applicationDefault } from 'firebase-admin/app';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebase: App;

  onModuleInit() {
    this.firebase = initializeApp({
      credential: applicationDefault(),
    });
  }
}
