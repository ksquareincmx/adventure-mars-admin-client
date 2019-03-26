
import { NativeStorage } from '@ionic-native/native-storage';
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorage {

  isNative: boolean = false;

  constructor(private NativeStorage: NativeStorage) {}

  public native(isNative: boolean) {
    this.isNative = isNative;
  }

  public getSync(key) {
    throw new Error('LocalStorage:getSync method deprecated, use LocalStorage:get with Promises')
    //return localStorage.getItem(key);
  }

  public get(key): Promise <any> {

    if(this.isNative) {
      // https://github.com/TheCocoaProject/cordova-plugin-nativestorage#error-codes
      return this.NativeStorage.getItem(key)
      .catch((error) => {
        // NATIVE_WRITE_FAILED = 1
        // ITEM_NOT_FOUND = 2
        // NULL_REFERENCE = 3
        // UNDEFINED_TYPE = 4
        // JSON_ERROR = 5
        // WRONG_PARAMETER = 6
        if(error.code == 2) return null;
        throw error;
      });
    } else {
      return new Promise((resolve, reject) => {
        let val: string = localStorage.getItem(key);
        resolve(val);
      });
    }
  }

  public set(key, val): Promise <any> {
    if(this.isNative) {
      return this.NativeStorage.setItem(key, val);
    } else {
      return new Promise((resolve, reject) => {
        localStorage.setItem(key, val);
        resolve(true);
      });
    }
  }

  public remove(key): Promise <any> {
    if(this.isNative) {
      return this.NativeStorage.remove(key);
    } else {
      return new Promise((resolve, reject) => {
        try {
          localStorage.removeItem(key);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    }
  }

  public changeStorage(): Promise<any> {

    if (this.isNative) {
      return this.NativeStorage.getItem('moved')
      .catch((error) => {
        if(error.code == 2) {
          let keys = ['email', 'userId', 'profileId', 'token', 'alreadyStarted'];

          let promises = keys.map((key) => {
            let item = localStorage.getItem(key);
            return this.set(key, item);
          });

          return Promise.all(promises);
        }
      })
      .then(() => this.NativeStorage.setItem('moved', 'true'));

    } else {
      return Promise.resolve(true);
    }

  }


}
