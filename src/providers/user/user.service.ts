import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { FlugQuery } from "./../../components/base-service/base-service";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";

import { User } from "./user.class";
import * as _ from "underscore";

@Injectable()
export class UserService extends ServiceProvider<User> {
  protected endpoint: string = "user";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(User, http, auth, menuStorage);
  }

  protected addQuery(query: any = {}) {
    let qs: any = {};

    let opts = _.extendOwn(query, this.query);

    for (let key in opts) {
      if (typeof opts[key] === "string") {
        qs[key] = opts[key];
      } else {
        qs[key] = JSON.stringify(opts[key]);
      }
    }

    if (this.auth.getRole() === "admin" && this.adminPolicy) {
      let where: any = {};
      try {
        if (qs.hasOwnProperty("where")) where = JSON.parse(qs.where);
      } catch (e) {}
      where.masterId = this.menuStorage.getClientForPolicies().id;
      qs.where = JSON.stringify(where);
    }

    return qs;
  }

  getAllLeaders(): Promise<User[]> {
    let qs: FlugQuery = { where: { role: "leader" }, populate: ["Unit"] };

    return this.http
      .get(this.getEndpoint(), { params: this.addQuery(qs) })
      .toPromise()
      .then(response => User.castArray(response.json()))
      .catch(err => this.handleError(err));
  }

  getAllScouts(): Promise<User[]> {
    let qs: FlugQuery = { where: { role: "scout" } };
    if (this.auth.role === "leader") {
      qs.where.unitId = this.auth.getUnitId();
    }

    return this.http
      .get(this.getEndpoint(), { params: this.addQuery(qs) })
      .toPromise()
      .then(response => User.castArray(response.json()))
      .catch(err => this.handleError(err));
  }

  updateUnit(item: { id: number; unitId: number }): Promise<User> {
    const url = `${this.getEndpoint()}/${item.id}`;
    return this.http
      .put(url, { unitId: item.unitId }, { headers: this.headers })
      .toPromise()
      .then(response => Caster.cast<User>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
