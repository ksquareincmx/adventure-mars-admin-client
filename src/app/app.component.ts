import { Component, ViewChild } from "@angular/core";
import { Nav, Platform, Modal, ModalController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Events } from "ionic-angular";

import { AuthProvider } from "../providers/auth-provider/auth-provider";
import { MenuStorage } from "../providers/menu-storage/menu-storage";

import { LoginPage } from "../pages/login/login";
import { BlankPage } from "../pages/blank/blank";
import { UnitsPage } from "../pages/units/units";
import { LeadersPage } from "../pages/leaders/leaders";
import { ItemsPage } from "../pages/items/items";
import { ScoutsPage } from "../pages/scouts/scouts";
import { QuestsPage } from "../pages/quests/quests";
import { ScoreBoardPage } from "../pages/score-board/score-board";

const AdminHomePage = UnitsPage;
const LeaderHomePage = ScoutsPage;

const defAdminPages = [
  { title: "Leaders", component: LeadersPage, icon: "person", logout: false },
  { title: "Units", component: UnitsPage, icon: "people", logout: false },
  { title: "Items", component: ItemsPage, icon: "pricetags", logout: false }
];

const defLeaderPages = [
  { title: "Scouts", component: ScoutsPage, icon: "contacts", logout: false },
  { title: "Quests", component: QuestsPage, icon: "search", logout: false },
  { title: "Score Board", component: ScoreBoardPage, icon: "locate", logout: false }
];

interface PageSelect {
  title: string;
  icon: string;
  component: any;
  logout: boolean;
  action?: Function;
}

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = BlankPage;

  pages: Array<PageSelect>;
  selectedPage: PageSelect = defLeaderPages[0];

  hideSideMenu: boolean = false;
  showingLogin: boolean = false;

  loginModal: Modal;

  actAsClient: boolean = false;

  currentPlace: string | null = null;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public auth: AuthProvider,
    public events: Events,
    public modalController: ModalController,
    public menuStorage: MenuStorage
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initEvents();
      this.auth.init();
    });
  }

  initEvents() {
    this.events.subscribe("auth:ready", () => {
      if (this.auth.isLoggedIn()) {
        this.goMainPage();
      } else {
        this.showLoginModal();
      }
    });

    // Manage 403 errors (from auth-http-interceptor)
    this.events.subscribe("auth:unauthorized", () => {
      this.auth.logout();
    });

    this.events.subscribe("auth:logout", () => {
      this.showLoginModal();
    });

    this.events.subscribe("menu:change", (section: string, userId?: any) => {
      if (section === "admin") {
        this.actAsClient = false;
        this.pages = defAdminPages;
      }

      if (section === "leader") {
        if (this.auth.getRole() === "admin") {
          this.actAsClient = true;
        }
        this.pages = defLeaderPages;
      }
    });
  }

  openPage(page) {
    // Special case for login page
    if (page.logout) {
      this.auth.logout();
      this.showLoginModal();
      return;
    }
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.selectedPage = page;
  }

  showLoginModal() {
    if (this.showingLogin) return;
    this.showingLogin = true;
    // When showing login modal we have to hide any important info because we are no longer logged in
    if (this.nav) this.nav.setRoot(BlankPage);

    this.loginModal = this.modalController.create(
      LoginPage,
      {},
      {
        showBackdrop: false,
        enableBackdropDismiss: false
      }
    );

    this.loginModal.onDidDismiss(data => {
      this.showingLogin = false;

      // Go to Controls Page by default after login
      this.goMainPage();
    });

    this.loginModal.present();
  }

  goMainPage() {
    if (this.auth.role === "admin") {
      this.actAsClient = false;
      this.pages = defAdminPages;
      this.nav.setRoot(AdminHomePage);
      this.selectedPage = defAdminPages[1];
    } else if (this.auth.role === "leader") {
      this.actAsClient = false;
      this.pages = defLeaderPages;
      this.nav.setRoot(LeaderHomePage);
      this.selectedPage = defLeaderPages[0];
    } else {
      // TODO dont allow scouts to enter here, show message?
      this.auth.logout();
    }

    setTimeout(() => {
      this.dismissLoginModal();
    }, 100);
  }

  goToClient() {
    this.events.publish("menu:change", "leader", this.menuStorage.client.id);
    this.nav.setRoot(LeaderHomePage);
  }

  dismissLoginModal() {
    if (!this.loginModal) return;
    this.loginModal.dismiss();
  }

  setSideMenuHidden(hidden: boolean) {
    this.hideSideMenu = hidden;
  }

  isSideMenuHidden(): boolean {
    if (!this.auth.isLoggedIn()) return true;
    return this.hideSideMenu;
  }
}
