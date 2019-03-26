import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule, Events } from "ionic-angular";
import { HttpModule, Http, RequestOptions } from "@angular/http";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AuthConfig } from "angular2-jwt";
import { NativeStorage } from "@ionic-native/native-storage";

import { MyApp } from "./app.component";

// Pages
import { HomePage } from "../pages/home/home";
import { ListPage } from "../pages/list/list";
import { BlankPage } from "../pages/blank/blank";
import { LoginPage } from "../pages/login/login";
import { UnitsPage } from "../pages/units/units";
import { EditUnitPage } from "../pages/edit-unit/edit-unit";
import { LeadersPage } from "../pages/leaders/leaders";
import { EditUserPage } from "../pages/edit-user/edit-user";
import { ItemsPage } from "../pages/items/items";
import { EditItemPage } from "../pages/edit-item/edit-item";
import { EditCachePage } from "../pages/edit-cache/edit-cache";
import { EditItemInstancePage } from "../pages/edit-item-instance/edit-item-instance";
import { ScoutsPage } from "../pages/scouts/scouts";
import { QuestsPage } from "../pages/quests/quests";
import { QuestPage } from "../pages/quest/quest";
import { ScoreBoardPage } from "../pages/score-board/score-board";

// Services
import { UserService } from "../providers/user/user.service";
import { UnitService } from "../providers/unit/unit.service";
import { ItemService } from "../providers/item/item.service";
import { ItemInstanceService } from "../providers/item-instance/item-instance.service";
import { QuestService } from "../providers/quest/quest.service";
import { QuestRunService } from "../providers/quest-run/quest-run.service";
import { FoundItemService } from "../providers/found-item/found-item.service";

// Providers
import { AuthHttpInterceptor } from "../providers/auth-http-interceptor/auth-http-interceptor";
import { AuthProvider } from "../providers/auth-provider/auth-provider";
import { MenuStorage } from "../providers/menu-storage/menu-storage";
import { LocalStorage } from "../providers/local-storage/local-storage";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";

export function authFactory(http: Http, events: Events, local: LocalStorage) {
  return new AuthHttpInterceptor(
    new AuthConfig({
      noJwtError: true,
      tokenName: "token",
      tokenGetter: () => local.get("token")
      // globalHeaders: [{ "Content-Type": "application/json" }]
    }),
    http,
    new RequestOptions(),
    events
  );
}

export const authHttpProvider = {
  provide: AuthHttpInterceptor,
  useFactory: authFactory,
  deps: [Http, Events, LocalStorage]
};

@NgModule({
  declarations: [
    MyApp,
    BlankPage,
    LoginPage,
    UnitsPage,
    EditUnitPage,
    EditUserPage,
    LeadersPage,
    ItemsPage,
    EditItemPage,
    EditCachePage,
    EditItemInstancePage,
    ScoutsPage,
    QuestsPage,
    QuestPage,
    ScoreBoardPage,
    HomePage,
    ListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      mode: "md"
    }),
    HttpModule,
    LeafletModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BlankPage,
    LoginPage,
    UnitsPage,
    EditUnitPage,
    EditUserPage,
    LeadersPage,
    ItemsPage,
    EditItemPage,
    EditCachePage,
    EditItemInstancePage,
    ScoutsPage,
    QuestsPage,
    QuestPage,
    ScoreBoardPage,
    HomePage,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthProvider,
    authHttpProvider,
    LocalStorage,
    NativeStorage,
    MenuStorage,
    UserService,
    UnitService,
    ItemService,
    ItemInstanceService,
    QuestService,
    QuestRunService,
    FoundItemService
  ]
})
export class AppModule {}
