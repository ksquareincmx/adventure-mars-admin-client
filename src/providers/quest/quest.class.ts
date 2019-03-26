import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";

export class Quest extends BaseModel {
  name: string = "";
  published: boolean = false;
  paused: boolean = false;
  showDistance: boolean = false;
  startTime: string = new Date().toISOString();
  endTime: string = new Date().toISOString();
  timeLimit: number = 60;
  unitId: number;

  static castArray<Quest>(json: any): Quest[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return Quest.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<Quest>(json: any): Quest {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const user = _.extend(new Quest(), json);
      return user;
    }
  }
}
