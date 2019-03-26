import {
  App,
  AlertController,
  ToastController,
  LoadingController,
  ModalController
} from "ionic-angular";

export abstract class BasePage {
  public loader;
  public isDirty: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private _app: App,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {}

  ionViewDidEnter() {
    this._app.setTitle("Jungle Scout Admin");
  }

  ionViewCanLeave() {
    if (!this.isDirty) {
      return true;
    } else {
      const title = "There are unsaved changes";
      const message = "If you leave the view, changes could be lost, are you sure?";

      return this.showConfirmAlertPromise(title, message);
    }
  }

  showToast(message: string, duration: number = 3000) {
    if (!message) throw new Error("Message argument is needed");
    this.toastCtrl
      .create({
        position: "bottom",
        message,
        duration
      })
      .present();
  }

  presentLoader(message: string = "Loading...") {
    this.loader = this.loadingCtrl.create({
      content: message
    });
    this.loader.present();
  }

  dismissLoader() {
    if (this.loader) this.loader.dismiss();
  }

  showAlert(title: string, message: string = "", okCallback?: Function) {
    if (!okCallback) okCallback = () => {};
    this.alertCtrl
      .create({
        title,
        message,
        buttons: [
          {
            text: "Ok",
            handler: data => okCallback(data)
          }
        ]
      })
      .present();
  }

  showAlertPromise(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.showAlert(title, message, () => resolve(true));
    });
  }

  showConfirmAlert(
    title: string,
    message: string,
    okCallback?: Function,
    cancelCallback?: Function
  ) {
    if (!okCallback) okCallback = () => {};
    if (!cancelCallback) cancelCallback = () => {};
    this.alertCtrl
      .create({
        title,
        message,
        buttons: [
          {
            text: "Cancel",
            handler: data => cancelCallback(data)
          },
          {
            text: "Yes",
            handler: data => okCallback(data)
          }
        ]
      })
      .present();
  }

  showConfirmAlertPromise(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.showConfirmAlert(title, message, () => resolve(true), () => resolve(false));
    });
  }

  showModal(page, parameters, dismissCallback?: Function) {
    if (!dismissCallback) dismissCallback = () => {};
    let modal = this.modalCtrl.create(page, parameters);
    modal.onDidDismiss(data => dismissCallback(data));
    modal.present();
  }

  showModalPromise(page, parameters): Promise<any> {
    return new Promise(resolve => {
      this.showModal(page, parameters, data => resolve(data));
    });
  }

  setDirty() {
    this.isDirty = true;
  }

  registerError(error) {
    console.error(error);
  }
}
