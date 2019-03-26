import { Injectable } from "@angular/core";
import { ServiceProvider } from "./../service-provider/service-provider";
import { AuthProvider } from "../auth-provider/auth-provider";
import { AuthHttpInterceptor } from "../auth-http-interceptor/auth-http-interceptor";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { Caster } from "./../../components/helpers/helper";
import { FlugQuery } from "./../../components/base-service/base-service";

import { QuestRun } from "./quest-run.class";

@Injectable()
export class QuestRunService extends ServiceProvider<QuestRun> {
  protected endpoint: string = "questrun";

  constructor(http: AuthHttpInterceptor, auth: AuthProvider, menuStorage: MenuStorage) {
    super(QuestRun, http, auth, menuStorage);
  }

  getAllWithDetails(): Promise<QuestRun[]> {
    let qs: FlugQuery = {};
    qs.where = {};
    qs.populate = ["Quest"];
    const url = `${this.getEndpoint()}`;
    return this.http
      .get(url, { params: this.addQuery(qs) })
      .toPromise()
      .then(response => Caster.castArray<QuestRun>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  getAllFromQuest(questId: number): Promise<QuestRun[]> {
    let qs: FlugQuery = {};
    qs.where = { questId };
    qs.populate = ["Quest", "User"];
    const url = `${this.getEndpoint()}`;
    return this.http
      .get(url, { params: this.addQuery(qs) })
      .toPromise()
      .then(response => Caster.castArray<QuestRun>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }
}
