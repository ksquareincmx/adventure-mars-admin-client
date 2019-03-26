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

import { Item, ItemService } from "../../providers/item";
import { ItemInstance } from "../../providers/item-instance";

// Global variable, should be available in scope
declare var urlsServerConfig: any;

@Component({
  selector: "page-edit-item-instance",
  templateUrl: "edit-item-instance.html"
})
export class EditItemInstancePage extends BasePage {
  items: Item[] = [];
  itemInstance: ItemInstance = new ItemInstance();
  isNew: boolean = false;

  baseFileUrl: string =
    urlsServerConfig.protocol + "://" + urlsServerConfig.url + urlsServerConfig.port + "/uploads/";

  constructor(
    _app: App,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public ItemService: ItemService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
    this.itemInstance = _.clone(this.navParams.get("itemInstance"));
    this.items = this.navParams.get("items");
    const questId = this.navParams.get("questId");
    const unitId = this.navParams.get("unitId");
    const location = this.navParams.get("location");
    if (this.itemInstance == null) {
      this.itemInstance = new ItemInstance();
      this.itemInstance.questId = questId;
      this.itemInstance.unitId = unitId;
      this.itemInstance.location = location;
      this.isNew = true;
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  selectDismiss(item: Item) {
    this.itemInstance.item = item;
    this.itemInstance.name = item.name;
    this.itemInstance.description = item.description;
    this.dismiss(this.itemInstance);
  }
}
