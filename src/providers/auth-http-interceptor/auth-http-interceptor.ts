import { Http, Request, RequestOptionsArgs, Response, RequestOptions } from "@angular/http";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/throw";
import { Events } from "ionic-angular";

export class AuthHttpInterceptor extends AuthHttp {
  constructor(options: AuthConfig, http: Http, defOpts: RequestOptions, public events: Events) {
    super(options, http, defOpts);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.request(url, options));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.get(url, options));
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.post(url, body, options));
  }

  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.put(url, body, options));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.delete(url, options));
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.catch((err, source) => {
      if (err.status === 401 || err.status === 403) {
        // Navigate to login
        this.events.publish("auth:unauthorized");
        return Observable.empty();
      } else {
        return Observable.throw(err);
      }
    });
  }
}
