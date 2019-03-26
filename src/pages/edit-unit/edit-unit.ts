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

@Component({
  selector: "page-edit-unit",
  templateUrl: "edit-unit.html"
})
export class EditUnitPage extends BasePage {
  unit: Unit = null;
  isLoading: boolean = false;
  isNew: boolean = false;

  leaders: User[] = [];
  selectedLeaderId: number | string = "none";
  currentLeaderId: number = null;

  constructor(
    _app: App,
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
    this.unit = _.clone(this.navParams.get("unit"));
    if (this.unit == null) {
      this.unit = new Unit();
      this.isNew = true;
    } else {
      if (this.unit.leader != null) {
        this.selectedLeaderId = this.unit.leader.id;
        this.currentLeaderId = this.unit.leader.id;
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
    this.UserService.getAllLeaders().then((leaders: User[]) => {
      this.leaders = leaders;
      console.log(leaders);
      this.dismissLoader();
    });
  }

  dismiss(data) {
    this.viewCtrl.dismiss(null);
  }

  save() {
    this.presentLoader();
    this.UnitService.save(this.unit)
      .then((result: Unit) => {
        this.unit = result;
        let promises = [];
        if (this.currentLeaderId != null && this.selectedLeaderId !== this.currentLeaderId) {
          promises.push(this.UserService.updateUnit({ id: this.currentLeaderId, unitId: null }));
        }
        if (this.selectedLeaderId != null && typeof this.selectedLeaderId === "number") {
          this.UserService.updateUnit({
            id: this.selectedLeaderId as number,
            unitId: this.unit.id
          });
        }
        return Promise.all(promises);
      })
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
}
