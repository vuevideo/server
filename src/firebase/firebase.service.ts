import { Injectable, OnModuleInit } from '@nestjs/common';
import { App, initializeApp, applicationDefault } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Storage, getStorage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firebase: App;
  private _auth: Auth;
  private _storage: Storage;

  onModuleInit() {
    this._firebase = initializeApp({
      credential: applicationDefault(),
    });

    this._auth = getAuth();
    this._storage = getStorage();
  }

  public get auth() {
    return this._auth;
  }

  public get storage() {
    return this._storage;
  }
}
