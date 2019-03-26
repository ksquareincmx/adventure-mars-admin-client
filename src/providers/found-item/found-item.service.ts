import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";
import { FlugQuery } from "./../../components/base-service/base-service";

import { FoundItem } from "./found-item.class";

@Injectable()
export class FoundItemService extends ServiceProvider<FoundItem> {
  protected endpoint: string = "founditem";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(FoundItem, http, auth, menuStorage);
  }

  getAllFromQuest(questId: number): Promise<FoundItem[]> {
    let qs: FlugQuery = {};
    qs.where = { questId };
    const url = `${this.getEndpoint()}`;
    return this.http
      .get(url, { params: this.addQuery(qs) })
      .toPromise()
      .then(response => Caster.castArray<FoundItem>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
