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

@Component({
  selector: "page-edit-item",
  templateUrl: "edit-item.html"
})
export class EditItemPage extends BasePage {
  item: Item = null;
  isLoading: boolean = false;
  isNew: boolean = false;

  model3dText: string = "No File Uploaded";
  model3d: any;

  previewText: string = "No File Uploaded";
  preview: any;

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
    this.item = _.clone(this.navParams.get("item"));
    if (this.item == null) {
      this.item = new Item();
      this.item.type = "private";
      this.isNew = true;
    }
    if (this.item.model3d != null && this.item.model3d.length) {
      this.model3dText = this.item.model3d;
    }
    if (this.item.preview != null && this.item.preview.length) {
      this.previewText = this.item.preview;
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
    this.viewCtrl.dismiss(null);
  }

  save() {
    this.presentLoader();
    let promise: Promise<any> = Promise.resolve();
    if (this.item.id == null) {
      promise = this.ItemService.uploadNew({
        model3d: this.model3d,
        preview: this.preview,
        name: this.item.name,
        description: this.item.description,
        type: this.item.type
      });
    } else {
      promise = this.ItemService.upload({
        id: this.item.id,
        model3d: this.model3d,
        preview: this.preview,
        name: this.item.name,
        description: this.item.description,
        type: this.item.type
      });
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

  model3dSelect(evt) {
    if (evt.srcElement.files.length) {
      this.model3dText = "Apply to upload new file";
      this.model3d = evt.srcElement.files[0];
    }
  }

  previewSelect(evt) {
    if (evt.srcElement.files.length) {
      this.previewText = "Apply to upload new file";
      this.preview = evt.srcElement.files[0];
    }
  }

  model3dInvalid(): boolean {
    return this.model3dText == null || this.model3dText === "No File Uploaded";
  }

  previewInvalid(): boolean {
    return this.previewText == null || this.previewText === "No File Uploaded";
  }
}
