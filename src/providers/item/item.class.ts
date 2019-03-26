import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";

export class Item extends BaseModel {
  name: string;
  description: string;
  model3d: string;
  preview: string;
  type: "private" | "public";

  static castArray<Item>(json: any): Item[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return Item.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<Item>(json: any): Item {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const item = _.extend(new Item(), json);
      return item;
    }
  }
}
