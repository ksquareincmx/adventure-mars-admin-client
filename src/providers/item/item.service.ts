import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";

import { Item } from "./item.class";

@Injectable()
export class ItemService extends ServiceProvider<Item> {
  protected endpoint: string = "item";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(Item, http, auth, menuStorage);
  }

  uploadNew(itemData: {
    model3d: any;
    preview: any;
    name: string;
    description: string;
    type: "private" | "public";
  }): Promise<Item> {
    const url = `${this.getEndpoint()}/upload`;
    let fd = new FormData();
    fd.append("model3d", itemData.model3d);
    fd.append("preview", itemData.preview);
    fd.append("name", itemData.name);
    fd.append("description", itemData.description);
    fd.append("type", itemData.type);
    return this.http
      .post(url, fd)
      .toPromise()
      .then(response => Caster.cast<Item>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  upload(itemData: {
    id: number;
    model3d: any;
    preview: any;
    name?: string;
    description?: string;
    type?: "private" | "public";
  }): Promise<Item> {
    const url = `${this.getEndpoint()}/${itemData.id}/upload`;
    let fd = new FormData();
    fd.append("model3d", itemData.model3d);
    fd.append("preview", itemData.preview);
    if (itemData.name != null) fd.append("name", itemData.name);
    if (itemData.description != null) fd.append("description", itemData.description);
    if (itemData.type != null) fd.append("type", itemData.type);
    return this.http
      .post(url, fd)
      .toPromise()
      .then(response => Caster.cast<Item>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
