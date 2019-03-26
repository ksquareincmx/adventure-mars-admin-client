import { Component } from "@angular/core";
import {
  App,
  Events,
  ViewController,
  LoadingController,
  Platform,
  AlertController,
  ToastController,
  ModalController
} from "ionic-angular";
import { AuthProvider } from "../../providers/auth-provider/auth-provider";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { validateEmail } from "../../providers/email-validator/email-validator";

import { BasePage } from "./../../components/base-page/base-page";

export enum State {
  LOGIN,
  SIGNUP,
  RECOVER
}

@Component({
  templateUrl: "login.html"
})
export class LoginPage extends BasePage {
  // disallow back button press in Android
  deregisterBackButton: any;

  badLogin: boolean;
  error: number;

  state: State = State.LOGIN;

  public form = new FormGroup({
    email: new FormControl("", Validators.compose([Validators.required, validateEmail])),
    password: new FormControl(
      "",
      Validators.compose([Validators.required, Validators.minLength(8)])
    )
  });

  public formRecover = new FormGroup({
    email: new FormControl("", Validators.compose([Validators.required, validateEmail]))
  });

  public loader: any;

  constructor(
    _app: App,
    public viewCtrl: ViewController,
    public auth: AuthProvider,
    public alertController: AlertController,
    public platform: Platform,
    public events: Events,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
    this.badLogin = false;
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.auth.isLoggedIn()) {
      // We are already logged in, go to controls
      this.viewCtrl.dismiss();
      return;
    }
    // disallow back button press in Android
    this.deregisterBackButton = this.platform.registerBackButtonAction(() => null);
  }

  ionViewWillLeave() {
    this.deregisterBackButton();
  }

  submit() {
    this.badLogin = false;

    this.presentLoader("Iniciando Sesión...");

    this.auth
      .login(this.form.value.email, this.form.value.password)
      .then(res => {
        this.dismissLoader();
        // this.dismissView(); // commented because of a removeView not found error
      })
      .catch(err => {
        this.badLogin = true;
        this.error = err.status;
        this.dismissLoader();
      });
  }

  goLogin() {
    this.badLogin = false;
    this.state = State.LOGIN;
  }

  isStateLogin() {
    return this.state === State.LOGIN;
  }

  goRecover() {
    this.badLogin = false;
    this.state = State.RECOVER;
  }

  isStateRecover() {
    return this.state === State.RECOVER;
  }

  goSignup() {
    this.badLogin = false;
    this.state = State.SIGNUP;
  }

  isStateSignup() {
    return this.state === State.SIGNUP;
  }

  dismissView(): Promise<any> {
    return this.viewCtrl.dismiss();
  }

  recover() {
    this.badLogin = false;

    this.presentLoader("Enviando");

    this.auth
      .recover(this.formRecover.value.email)
      .then(res => {
        this.showAlert("Email enviado", "Se ha enviado un email correctamente", () => {
          this.goLogin();
        });
        this.dismissLoader();
      })
      .catch(err => {
        if (err.status === 404) {
          this.showAlert("Cuenta no encontrada", "No pudimos encontrar esta cuenta");
        } else {
          this.badLogin = true;
          this.error = err.status;
        }
        this.dismissLoader();
      });
  }

  signup() {
    this.badLogin = false;

    this.presentLoader("Iniciando Sesión...");

    this.auth
      .signup(this.form.value.email, this.form.value.password)
      .then(res => {
        this.viewCtrl.dismiss();
        this.dismissLoader();
      })
      .catch(err => {
        this.registerError(err);
        if (err.status === 403) {
          this.showAlert("Cuenta existente", "Este email se registro anteriormente");
        } else {
          this.badLogin = true;
          this.error = err.status;
        }
        this.dismissLoader();
      });
  }
}
