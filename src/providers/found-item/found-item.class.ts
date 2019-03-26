import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";

export class FoundItem extends BaseModel {
  itemInstanceId: number;
  questId: number;
  userId: number;
  time: Date;

  static castArray<FoundItem>(json: any): FoundItem[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return FoundItem.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<FoundItem>(json: any): FoundItem {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const user = _.extend(new FoundItem(), json);
      return user;
    }
  }
}
