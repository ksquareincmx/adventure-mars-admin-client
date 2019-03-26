import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";

import { Quest } from "./quest.class";

@Injectable()
export class QuestService extends ServiceProvider<Quest> {
  protected endpoint: string = "quest";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(Quest, http, auth, menuStorage);
  }

  getAllWithDetails(): Promise<Quest[]> {
    const url = `${this.getEndpoint()}/details`;
    return this.http
      .get(url, { params: this.addQuery() })
      .toPromise()
      .then(response => Caster.castArray<Quest>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
