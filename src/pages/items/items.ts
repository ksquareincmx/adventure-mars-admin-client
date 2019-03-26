import { Component } from "@angular/core";
import { App, ModalController, NavParams } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

import { EditItemPage } from "../edit-item/edit-item";

import { Item, ItemService } from "../../providers/item";

// Global variable, should be available in scope
declare var urlsServerConfig: any;

@Component({
  selector: "page-items",
  templateUrl: "items.html"
})
export class ItemsPage extends BasePage {
  isLoading: boolean = false;

  items: Item[];

  baseFileUrl: string =
    urlsServerConfig.protocol + "://" + urlsServerConfig.url + urlsServerConfig.port + "/uploads/";

  constructor(
    _app: App,
    public itemService: ItemService,
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
    return this.itemService
      .getAll()
      .then(items => {
        this.items = items;
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
    let editItemModal = this.modalCtrl.create(EditItemPage);
    editItemModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editItemModal.present();
  }

  edit(item: Item) {
    let editItemModal = this.modalCtrl.create(EditItemPage, { item });
    editItemModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editItemModal.present();
  }

  delete(item: Item) {
    this.showConfirmAlertPromise(
      "Are you sure?",
      "Deleting an Item can affect existing Quests"
    ).then((response: boolean) => {
      if (!response) return;
      this.itemService
        .delete(item)
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
