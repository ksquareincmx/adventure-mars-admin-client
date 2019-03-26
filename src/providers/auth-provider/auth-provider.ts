import { Injectable, NgZone } from "@angular/core";
import { Http, Headers } from "@angular/http";
import "rxjs/add/operator/toPromise";
import { Events } from "ionic-angular";
import { LocalStorage } from "../local-storage/local-storage";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";

// Global variable, should be available in scope
declare var urlsServerConfig: any;

@Injectable()
export class AuthProvider {
  baseUrl: string =
    urlsServerConfig.protocol + "://" + urlsServerConfig.url + urlsServerConfig.port + "/api/v1";
  headers: Headers = new Headers();
  zoneImpl: NgZone;

  email: any = null;
  token: any = null;
  userId: any = null;
  role: string = "leader";
  unitId: number = null;

  loggedIn: boolean = false;
  ready: boolean = false;

  constructor(
    public http: Http,
    zone: NgZone,
    public events: Events,
    public local: LocalStorage,
    public authHttp: AuthHttpInterceptor
  ) {
    this.zoneImpl = zone;
    this.headers.append("Content-Type", "application/json");
  }

  public init(): Promise<any> {
    return this.local
      .get("email")
      .then(email => {
        if (email == null) throw "logout";
        this.email = email;
      })
      .then(() => this.local.get("userId"))
      .then(user => {
        if (user == null) throw "logout";
        this.userId = user;
      })
      .then(() => this.local.get("role"))
      .then(role => {
        if (role == null) throw "logout";
        this.role = role;
      })
      .then(() => this.local.get("unitId"))
      .then(unitId => {
        this.unitId = parseInt(unitId);
      })
      .then(() => this.local.get("token"))
      .then(token => {
        if (token == null) throw "logout";
        this.token = token;
        this.loggedIn = true;
        this.ready = true;

        this.events.publish("auth:ready");
      })
      .catch(error => {
        if (error == "logout") this.logout();
      });
  }

  public setCredentials(credentials): Promise<boolean> {
    this.token = credentials.token;
    this.email = credentials.user.email;
    this.userId = credentials.user.id;
    this.role = credentials.user.role;
    this.unitId = credentials.user.unitId;
    return Promise.all([
      this.local.set("token", this.token),
      this.local.set("email", this.email),
      this.local.set("userId", this.userId),
      this.local.set("role", this.role),
      this.local.set("unitId", this.unitId)
    ])
      .then(() => {
        this.events.publish("auth:ready");
        this.loggedIn = true;
        return true;
      })
      .catch(() => false);
  }

  public login(email, password) {
    return this.http
      .post(
        this.baseUrl + "/auth/login",
        { email, password },
        {
          headers: this.headers
        }
      )
      .toPromise()
      .then(res => res.json())
      .then(credential => this.setCredentials(credential))
      .catch(err => this.logoutOnError(err));
  }

  public recover(email) {
    return this.http
      .post(
        this.baseUrl + "/auth/reset",
        { email },
        {
          headers: this.headers
        }
      )
      .toPromise()
      .then(res => res.json())
      .catch(err => this.logoutOnError(err));
  }

  public signup(
    { name, email, password, role = "scout", unitId = null },
    setCredentials: boolean = true
  ) {
    // Needs to be a secure method
    // can not be access from the outside of the login
    return this.authHttp
      .post(
        this.baseUrl + "/auth/register",
        { name, email, password, role, unitId },
        {
          headers: this.headers
        }
      )
      .toPromise()
      .then(res => {
        if (setCredentials) {
          return this.setCredentials(res);
        } else {
          return true;
        }
      })
      .catch(err => this.logoutOnError(err));
  }

  public signupLeader({ name, email, password, unitId = null }): Promise<any> {
    // Needs to be a secure method
    // can not be access from the outside of the login
    return this.authHttp
      .post(
        this.baseUrl + "/auth/registerleader",
        { name, email, password, unitId },
        {
          headers: this.headers
        }
      )
      .toPromise();
  }

  public signupScout({ name, email, password, unitId = null }): Promise<any> {
    // Needs to be a secure method
    // can not be access from the outside of the login
    return this.authHttp
      .post(
        this.baseUrl + "/auth/register",
        { name, email, password, unitId },
        {
          headers: this.headers
        }
      )
      .toPromise();
  }

  public logout() {
    let token = this.getToken();
    let body: any = {};
    this.local.remove("token");
    this.local.remove("email");
    this.zoneImpl.run(() => {
      this.email = null;
      this.token = null;
      this.loggedIn = false;
    });

    if (token) {
      let headers: Headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${token}`);

      this.http
        .post(this.baseUrl + "/auth/logout", body, {
          headers: headers
        })
        .toPromise();
    }

    this.events.publish("auth:logout");
  }

  protected logoutOnError(err) {
    this.loggedIn = false;
    throw err;
  }

  public isLoggedIn(): boolean {
    //return this.loggedIn;
    return this.email != null && this.email !== "" && this.token != null && this.token !== "";
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getEmail(): string {
    return this.email;
  }

  public getToken(): string {
    return this.token;
  }

  public getUserId(): number {
    return parseInt(this.userId);
  }

  public getRole(): string {
    return this.role;
  }

  public getUnitId(): number {
    return this.unitId;
  }

  public hasPermission(permission: string): boolean {
    // TODO do something with permission?
    // add-place, edit-place, add-equipment, edit-equipment
    if (this.role === "scout") return false;
    return true;
  }
}
