import { Injectable, OnModuleInit } from '@nestjs/common';
import { App, initializeApp, applicationDefault } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firebase: App;
  private _auth: Auth;

  onModuleInit() {
    this._firebase = initializeApp({
      credential: applicationDefault(),
    });

    this._auth = getAuth();
  }

  public get auth() {
    return this._auth;
  }
}
