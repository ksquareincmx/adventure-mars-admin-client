import { Caster } from "./../../components/helpers/helper";
import { BaseModel } from "./../../components/base-model/base-model";
import { BaseService, FlugQuery } from "./../../components/base-service/base-service";
import { AuthHttpInterceptor } from "./../../providers/auth-http-interceptor/auth-http-interceptor";
import { AuthProvider } from "./../../providers/auth-provider/auth-provider";
import * as _ from "underscore";
import "rxjs/add/operator/toPromise";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

export abstract class ServiceProvider<T extends BaseModel> extends BaseService {
  constructor(
    public base: typeof BaseModel,
    public http: AuthHttpInterceptor,
    public auth: AuthProvider,
    public menuStorage: MenuStorage
  ) {
    super(http, auth, menuStorage);
  }

  getAll(): Promise<T[]> {
    return this.http
      .get(this.getEndpoint(), { params: this.addQuery() })
      .toPromise()
      .then(response => Caster.castArray<T>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  get(id: number): Promise<T> {
    const url = `${this.getEndpoint()}/${id}`;
    return this.http
      .get(url, { params: this.addQuery() })
      .toPromise()
      .then(response => Caster.cast<T>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  getMany(ids: Array<number | string>) {
    let qs: FlugQuery = {};
    qs.where = { id: { $in: ids } };

    return this.http
      .get(this.getEndpoint(), { params: this.addQuery(qs) })
      .toPromise()
      .then(response => Caster.castArray<T>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  save(item: T): Promise<T> {
    if (item.isFilled()) {
      return this.update(item);
    } else {
      return this.create(item);
    }
  }

  create(item: T): Promise<T> {
    return this.http
      .post(this.getEndpoint(), this.encodeForSubmit(item), { headers: this.headers })
      .toPromise()
      .then(response => Caster.cast<T>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  update(item: T): Promise<T> {
    let copy = _.clone(item);
    const url = `${this.getEndpoint()}/${copy.id}`;
    delete copy.id;
    return this.http
      .put(url, this.encodeForSubmit(copy), { headers: this.headers })
      .toPromise()
      .then(response => Caster.cast<T>(this.base, response.json()))
      .catch(err => this.handleError(err));
  }

  delete(item: T): Promise<void> {
    const url = `${this.getEndpoint()}/${item.id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .toPromise()
      .then(() => null)
      .catch(err => this.handleError(err));
  }
}
