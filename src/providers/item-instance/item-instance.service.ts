import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";
import { FlugQuery } from "./../../components/base-service/base-service";

import { ItemInstance } from "./item-instance.class";

@Injectable()
export class ItemInstanceService extends ServiceProvider<ItemInstance> {
  protected endpoint: string = "iteminstance";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(ItemInstance, http, auth, menuStorage);
  }

  getFromQuest(questId: number) {
    let qs: FlugQuery = {};
    qs.where = { questId };
    qs.populate = ["Item"];
    return this.http
      .get(this.getEndpoint(), { params: this.addQuery(qs) })
      .toPromise()
      .then(response => Caster.castArray<ItemInstance>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  protected encodeForSubmit(item: any) {
    if (this.auth.getRole() === "admin" && this.adminPolicy && this.modelHasUserId) {
      item.userId = this.menuStorage.getClientForPolicies().id;
    }
    item.location = JSON.stringify(item.location);
    return JSON.stringify(item);
  }
}
