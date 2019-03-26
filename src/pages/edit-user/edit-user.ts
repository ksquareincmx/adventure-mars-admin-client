import { Component } from "@angular/core";
import { App, NavController, ViewController, NavParams } from "ionic-angular";
import {
  AlertController,
  ToastController,
  LoadingController,
  ModalController
} from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";

import * as _ from "lodash";

import { Unit, UnitService } from "../../providers/unit";
import { User, UserService } from "../../providers/user";
import { AuthProvider } from "../../providers/auth-provider/auth-provider";

@Component({
  selector: "page-edit-user",
  templateUrl: "edit-user.html"
})
export class EditUserPage extends BasePage {
  user: User = null;
  isLoading: boolean = false;
  isNew: boolean = false;

  units: Unit[] = [];
  selectedUnitId: number | string = "none";

  constructor(
    _app: App,
    public auth: AuthProvider,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public UnitService: UnitService,
    public UserService: UserService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
    this.user = _.clone(this.navParams.get("user"));
    console.log(this.user);
    if (this.user == null) {
      this.user = new User();
      // If we are signed up as leader, force default unitId as the same as the leader
      if (this.auth.getRole() === "leader") {
        this.user.unitId = this.auth.getUnitId();
        this.selectedUnitId = this.user.unitId;
      }
      this.isNew = true;
    } else {
      if (this.user.unitId != null) {
        this.selectedUnitId = this.user.unitId;
      }
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.load(true, null);
  }

  appResumed() {
    this.load(true, null);
  }

  load(show: boolean, refresher: any) {
    this.presentLoader();
    this.UnitService.getAll().then((units: Unit[]) => {
      this.units = units;
      console.log(units);
      this.dismissLoader();
    });
  }

  dismiss(data) {
    this.viewCtrl.dismiss(null);
  }

  save() {
    this.presentLoader();

    if (typeof this.selectedUnitId === "number") {
      this.user.unitId = this.selectedUnitId;
      delete this.user.unit;
    }

    // TODO check if the unit belongs to other leader and unassign it (only if we are admin)...
    let promise: Promise<any> = Promise.resolve();
    if (this.user.id == null) {
      const { name, email, password, unitId }: any = this.user;
      if (this.auth.getRole() === "admin") {
        promise = this.auth.signupLeader({ name, email, password, unitId });
      }
      if (this.auth.getRole() === "leader") {
        promise = this.auth.signupScout({ name, email, password, unitId });
      }
    } else {
      promise = this.UserService.save(this.user);
    }
    promise
      .then(() => {
        this.dismissLoader();
        this.viewCtrl.dismiss();
      })
      .catch(err => {
        console.error(err);
        this.dismissLoader();
        this.showAlert("There was an error, please try again.");
      });
  }

  getActiveRole(): string {
    return this.auth.getRole();
  }

  unitInvalid(): boolean {
    return this.selectedUnitId == null || this.selectedUnitId === "none";
  }
}
