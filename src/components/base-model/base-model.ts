
import * as _ from 'underscore';

export abstract class BaseModel {

  id: number;

  // virtual, not saved to db
  dirty: boolean = false;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }

  public isFilled(): boolean {
    return (this.id != null);
  }

  public toJSON() {
    let copy = _.clone(this);
    Object.keys(this).forEach(key => {
      if(typeof this[key] == 'object' && copy[key]) {
        let newKey = `${key}Id`;
        copy[newKey] = this[key].id;
        delete copy[key];
      }
    });
    return copy;
  }

}
