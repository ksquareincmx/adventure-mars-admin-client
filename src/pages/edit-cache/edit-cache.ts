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

import { ItemInstance } from "../../providers/item-instance";

@Component({
  selector: "page-edit-cache",
  templateUrl: "edit-cache.html"
})
export class EditCachePage extends BasePage {
  cache: ItemInstance = null;

  latitude: number = 0;
  longitude: number = 0;

  constructor(
    _app: App,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
    this.cache = _.clone(this.navParams.get("cache"));
    if (this.cache == null) {
      this.cache = new ItemInstance();
    }

    const coordinates = this.cache.location.coordinates;
    if (coordinates != null && coordinates.length >= 2) {
      this.latitude = coordinates[0];
      this.longitude = coordinates[1];
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.load(true, null);
  }

  appResumed() {
    this.load(true, null);
  }

  load(show: boolean, refresher: any) {}

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  save() {
    this.cache.location.coordinates[0] = this.latitude;
    this.cache.location.coordinates[1] = this.longitude;
    this.dismiss(this.cache);
  }
}
