import { BaseModel } from "./../../components/base-model/base-model";
import { User } from "./../user";
import { Quest } from "./../quest";
import { FoundItem } from "./../found-item";
import * as _ from "underscore";

export class QuestRun extends BaseModel {
  questId: number;
  quest?: Quest;
  userId: number;
  user?: User;
  startTime: Date;
  endTime: Date;
  finishTime: Date;
  completed: boolean;

  foundItems?: FoundItem[] = []; // Not from service, used in score-board
  completionTime?: number; // Not from service, used in score-board

  static castArray<QuestRun>(json: any): QuestRun[] {
    if (_.isArray(json)) {
      return json.map(obj => {
        return QuestRun.cast(obj);
      });
    } else {
      throw new Error("Expecting an Array");
    }
  }

  static cast<QuestRun>(json: any): QuestRun {
    if (_.isArray(json)) {
      throw new Error("Expecting an Object");
    } else {
      const user = _.extend(new QuestRun(), json);
      return user;
    }
  }
}
