import { Component } from "@angular/core";
import { App, ModalController, NavParams } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

import { EditUnitPage } from "../edit-unit/edit-unit";

import { Unit, UnitService } from "../../providers/unit";

@Component({
  selector: "page-units",
  templateUrl: "units.html"
})
export class UnitsPage extends BasePage {
  isLoading: boolean = false;

  units: Unit[];

  constructor(
    _app: App,
    public unitService: UnitService,
    public modalController: ModalController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public menuStorage: MenuStorage
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.load(true, null);
  }

  appResumed() {
    this.load(true, null);
  }

  load(show: boolean, refresher: any) {
    this.isLoading = true;
    this.presentLoader();
    return this.unitService
      .getAllWithDetails()
      .then(units => {
        this.units = units;
        this.isLoading = false;
        this.dismissLoader();
      })
      .catch(err => {
        this.registerError(err);
        this.isLoading = false;
        this.dismissLoader();
      });
  }

  add() {
    let editUnitModal = this.modalCtrl.create(EditUnitPage);
    editUnitModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editUnitModal.present();
  }

  edit(unit: Unit) {
    let editUnitModal = this.modalCtrl.create(EditUnitPage, { unit });
    editUnitModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editUnitModal.present();
  }

  delete(unit: Unit) {
    this.showConfirmAlertPromise(
      "Are you sure?",
      "Deleting a Unit will remove all its users' data"
    ).then((response: boolean) => {
      if (!response) return;
      this.unitService
        .delete(unit)
        .then(() => {
          this.load(true, null);
        })
        .catch(err => {
          console.error(err);
          this.showAlert("There was an error, please try again");
        });
    });
  }
}
