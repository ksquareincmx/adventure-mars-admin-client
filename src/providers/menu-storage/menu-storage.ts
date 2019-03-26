import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import "rxjs/add/operator/toPromise";
import { User } from "../user";
import { AuthProvider } from "../auth-provider/auth-provider";

@Injectable()
export class MenuStorage {
  client: User = null;
  currentUser: User = null;
  subMenu: boolean = false;

  constructor(public events: Events, public auth: AuthProvider) {}

  getClientForPolicies(): User {
    return this.auth.userId;
    // if (this.currentUser.role === "admin") {
    //   return this.client;
    // } else {
    //   return this.currentUser;
    // }
  }

  setClientStorage(client: User) {
    this.client = client;
  }
}
