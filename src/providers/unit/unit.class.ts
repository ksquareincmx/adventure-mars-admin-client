import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";

export class Unit extends BaseModel {
  name: string;
  memberCount?: number;
  leader?: {
    id: number;
    name: string;
    email: string;
  };

  static castArray<Unit>(json: any): Unit[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return Unit.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<Unit>(json: any): Unit {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const user = _.extend(new Unit(), json);
      return user;
    }
  }
}
