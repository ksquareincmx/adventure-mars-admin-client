import { Headers } from '@angular/http';
import { jwtError } from './../helpers/helper';
import { AuthHttpInterceptor } from './../../providers/auth-http-interceptor/auth-http-interceptor';
import { AuthProvider } from './../../providers/auth-provider/auth-provider';
import { MenuStorage } from '../../providers/menu-storage/menu-storage';

import * as _ from 'underscore';
import 'rxjs/add/operator/toPromise';

export interface FlugQuery {
  populate?: string | Array<any>;
  where?: any;
  skip?: number;
  limit?: number;
}

export abstract class BaseService {

  protected query: FlugQuery = {};
  protected headers = new Headers({'Content-Type': 'application/json'});
  protected endpoint: string;
  protected serverAddress: string;
  protected adminPolicy: boolean = true;
  protected modelHasUserId: boolean = true;

  constructor(
    public http: AuthHttpInterceptor,
    public auth: AuthProvider,
    public menuStorage: MenuStorage
  ){
    this.serverAddress = auth.baseUrl;
  }

  protected getEndpoint(): string {
    return `${this.serverAddress}/${this.endpoint}`;
  }

  protected addQuery(query: any = {}) {
    let qs:any = {};

    let opts = _.extendOwn(query, this.query);

    for(let key in opts) {
      if(typeof opts[key] === 'string') {
        qs[key] = opts[key];
      } else {
        qs[key] = JSON.stringify(opts[key]);
      }
    }

    if(this.auth.getRole() === 'admin' && this.adminPolicy){
      let where: any = {};
      try {
        if(qs.hasOwnProperty('where')) where = JSON.parse(qs.where);
      } catch(e) {}
      where.userId = this.menuStorage.getClientForPolicies().id;
      qs.where = JSON.stringify(where);

    }

    return qs;
  }

  protected encodeForSubmit(item: any){
    if(this.auth.getRole() === 'admin' && this.adminPolicy && this.modelHasUserId){
      item.userId = this.menuStorage.getClientForPolicies().id;
    }
    return JSON.stringify(item);
  }

  protected handleError(error: any): Promise<any> {

    if (jwtError(error)) {
      Promise.resolve(null);
    }

    return Promise.reject(error);
  }

}
