import { Component } from "@angular/core";
import { App, ModalController, NavParams, NavController } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

import { Quest, QuestService } from "../../providers/quest";
import { QuestPage } from "../quest/quest";

@Component({
  selector: "page-quests",
  templateUrl: "quests.html"
})
export class QuestsPage extends BasePage {
  isLoading: boolean = false;

  quests: Quest[];

  constructor(
    _app: App,
    public questService: QuestService,
    public modalController: ModalController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public menuStorage: MenuStorage,
    public navCtrl: NavController
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
    return this.questService
      .getAll()
      .then(quests => {
        this.quests = quests;
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
    this.navCtrl.push(QuestPage);
  }

  edit(quest: Quest) {
    this.navCtrl.push(QuestPage, { questId: quest.id });
  }

  delete(quest: Quest) {
    this.showConfirmAlertPromise("Are you sure?", "Deleting a Quest cannot be undone").then(
      (response: boolean) => {
        if (!response) return;
        this.questService
          .delete(quest)
          .then(() => {
            this.load(true, null);
          })
          .catch(err => {
            console.error(err);
            this.showAlert("There was an error, please try again");
          });
      }
    );
  }
}
