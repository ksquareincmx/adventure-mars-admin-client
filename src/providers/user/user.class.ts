import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";
import { Unit } from "./../unit";

export class User extends BaseModel {
  name: string;
  team: string;
  email: string;
  password?: string;
  role: "scout" | "leader" | "admin";
  currentLocation: any; // TODO
  unit: Unit;
  unitId: number;

  static castArray<User>(json: any): User[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return User.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<User>(json: any): User {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const user = _.extend(new User(), json);
      return user;
    }
  }
}
