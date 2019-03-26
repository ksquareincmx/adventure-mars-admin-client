import { Component } from "@angular/core";
import { App, ModalController, NavParams } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

import { EditUserPage } from "../edit-user/edit-user";

import { User, UserService } from "../../providers/user";

@Component({
  selector: "page-leaders",
  templateUrl: "leaders.html"
})
export class LeadersPage extends BasePage {
  isLoading: boolean = false;

  leaders: User[];

  constructor(
    _app: App,
    public userService: UserService,
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
    return this.userService
      .getAllLeaders()
      .then(leaders => {
        this.leaders = leaders;
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
    let editUnitModal = this.modalCtrl.create(EditUserPage);
    editUnitModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editUnitModal.present();
  }

  edit(user: User) {
    let editUserModal = this.modalCtrl.create(EditUserPage, { user });
    editUserModal.onDidDismiss(data => {
      this.load(true, null);
    });
    editUserModal.present();
  }

  delete(leader: User) {
    this.showConfirmAlertPromise("Are you sure?", "Deleting a User will remove all its data").then(
      (response: boolean) => {
        if (!response) return;
        this.userService
          .delete(leader)
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
