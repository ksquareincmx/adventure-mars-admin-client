import { BaseModel } from "./../../components/base-model/base-model";
import * as _ from "underscore";
import { Item } from "../item";

export interface GeoPoint {
  type: "Point";
  coordinates: number[];
}

export class ItemInstance extends BaseModel {
  name: string;
  description: string;
  itemId: number;
  questId: number;
  unitId: number;
  location: GeoPoint;
  item?: Item;

  static castArray<ItemInstance>(json: any): ItemInstance[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return ItemInstance.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<ItemInstance>(json: any): ItemInstance {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const item = _.extend(new ItemInstance(), json);
      return item;
    }
  }
}
