import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";

import { Unit } from "./unit.class";

@Injectable()
export class UnitService extends ServiceProvider<Unit> {
  protected endpoint: string = "unit";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(Unit, http, auth, menuStorage);
  }

  getAllWithDetails(): Promise<Unit[]> {
    const url = `${this.getEndpoint()}/details`;
    return this.http
      .get(url, { params: this.addQuery() })
      .toPromise()
      .then(response => Caster.castArray<Unit>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
