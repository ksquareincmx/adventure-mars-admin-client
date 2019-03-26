import { Component, NgZone } from "@angular/core";
import { App, ModalController, NavParams } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";

import { Quest, QuestService } from "../../providers/quest";
import { FoundItem, FoundItemService } from "../../providers/found-item";
import { User, UserService } from "../../providers/user";
import { QuestRun, QuestRunService } from "../../providers/quest-run";
import { ItemInstance, ItemInstanceService } from "../../providers/item-instance";
import { AuthProvider } from "../../providers/auth-provider/auth-provider";
import { tileLayer, latLng, Map, marker, divIcon } from "leaflet";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

momentDurationFormatSetup(moment);

// Global variable, should be available in scope
declare var urlsServerConfig: any;

const REFRESH_TOUT = 10000;

interface QuestTeam {
  name: string;
  completed: boolean;
  avgTime: number;
}

@Component({
  selector: "page-score-board",
  templateUrl: "score-board.html"
})
export class ScoreBoardPage extends BasePage {
  isLoading: boolean = false;

  questId: number = null;
  quests: Quest[] = [];
  caches: ItemInstance[] = [];
  showCaches: boolean = false;

  scoutQuests: QuestRun[] = [];
  filteredScoutQuests: QuestRun[] = [];
  foundItems: FoundItem[] = [];
  questTeams: QuestTeam[] = [];
  scoutsNotInQuest: User[] = [];
  filteredScoutsNotInQuest: User[] = [];

  filterTeam: string = "";
  hideScoutsNotInQuest: boolean = true;

  map: any = null;
  markers: any[] = [];
  scoutMarkers: any[] = [];

  refreshInterval: any = null;

  baseFileUrl: string =
    urlsServerConfig.protocol + "://" + urlsServerConfig.url + urlsServerConfig.port + "/uploads/";

  mapOptions = {
    layers: [
      tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 10,
    center: latLng(32.8208751, -96.871626)
    //attributionControl: false
  };

  layersControl = {
    baseLayers: {
      "Open Street Map": tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }),
      "NatGeo Worl Map": tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
          maxZoom: 16
        }
      ),
      Satellite: tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      )
    }
  };

  constructor(
    _app: App,
    public auth: AuthProvider,
    public questService: QuestService,
    public userService: UserService,
    public questRunService: QuestRunService,
    public foundItemService: FoundItemService,
    public itemInstanceService: ItemInstanceService,
    public modalController: ModalController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public menuStorage: MenuStorage,
    public zone: NgZone
  ) {
    super(_app, alertCtrl, toastCtrl, loadingCtrl, modalCtrl);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.load(true, null);
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, REFRESH_TOUT);
  }

  ionViewWillLeave() {
    if (this.refreshInterval != null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  appResumed() {
    this.load(true, null);
  }

  refresh() {
    this.load(true, null);
  }

  countCompleted(): number {
    let completed = 0;
    for (let quest of this.scoutQuests) {
      if (quest.completed) completed++;
    }
    return completed;
  }

  prepareScoutQuests(scoutQuests: QuestRun[]) {
    this.scoutQuests = scoutQuests.map(run => {
      if (run.user.team == null || !run.user.team.length) run.user.team = "No Team";
      return run;
    });
    this.scoutQuests.forEach(sQuest => {
      const allFoundItems = this.foundItems.filter(item => item.userId === sQuest.userId);
      let foundItems: FoundItem[] = [];
      // Remove duplicates
      for (let item of allFoundItems) {
        const alreadyExists = foundItems.find(foundItm => {
          return foundItm.itemInstanceId === item.itemInstanceId;
        });
        if (alreadyExists == null) foundItems.push(item);
      }
      sQuest.foundItems = foundItems;
      return sQuest;
    });
  }

  prepareQuestruns() {
    this.scoutQuests = this.scoutQuests.map(questrun => {
      questrun.completionTime = this.calculateCompletionTime(questrun);
      return questrun;
    });
    this.scoutQuests.sort((a, b) => {
      if (!a.completed && !b.completed) return b.foundItems.length - a.foundItems.length;
      if (!a.completed) return 1;
      if (!b.completed) return -1;
      return a.completionTime - b.completionTime;
    });
  }

  filterQuestRuns() {
    if (this.filterTeam == null || !this.filterTeam.length) {
      this.filteredScoutQuests = this.scoutQuests;
      return;
    }
    this.filteredScoutQuests = this.scoutQuests.filter(run => run.user.team === this.filterTeam);
  }

  filterScoutsNotInQuest() {
    this.filteredScoutsNotInQuest = this.scoutsNotInQuest.filter(scout => {
      let found = this.scoutQuests.find(run => run.user.id === scout.id);
      if (found != null) return false;
      return true;
    });
    if (this.filterTeam != null && this.filterTeam.length) {
      this.filteredScoutsNotInQuest = this.filteredScoutsNotInQuest.filter(
        scout => scout.team === this.filterTeam
      );
    }
  }

  onFilterQuestRunChange() {
    this.filterQuestRuns();
    this.filterScoutsNotInQuest();
    this.renderScouts();
  }

  prepareQuestTeams() {
    let teams: string[] = this.scoutQuests.map(questrun => questrun.user.team);
    teams = teams.sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1];
    });
    let questTeams = teams.map(name => {
      const runsOfTeam = this.scoutQuests.filter(questrun => questrun.user.team === name);
      let completed = true;
      let avgTime = 0;
      for (let run of runsOfTeam) {
        if (!run.completed) completed = false;
        avgTime += run.completionTime;
      }
      avgTime = avgTime / runsOfTeam.length;
      return {
        name,
        completed,
        avgTime
      };
    });
    this.questTeams = questTeams.sort((a, b) => {
      if (!a.completed) return 1;
      if (!b.completed) return -1;
      return a.avgTime - b.avgTime;
    });
  }

  load(show: boolean, refresher: any) {
    this.isLoading = true;
    this.presentLoader();
    return this.questService
      .getAll()
      .then((quests: Quest[]) => {
        this.quests = quests;
        return this.userService.getAll();
      })
      .then((users: User[]) => {
        this.scoutsNotInQuest = users.map(user => {
          if (user.team == null || !user.team.length) user.team = "No Team";
          return user;
        });
        if (this.questId == null) return []; // No itemInstances to load
        return this.itemInstanceService.getFromQuest(this.questId);
      })
      .then((caches: ItemInstance[]) => {
        this.caches = caches;
        this.isLoading = false;
        this.renderCaches();
        this.centerMapCaches();
        return this.foundItemService.getAllFromQuest(this.questId);
      })
      .then((foundItems: FoundItem[]) => {
        this.foundItems = foundItems;
        return this.questRunService.getAllFromQuest(this.questId);
      })
      .then((scoutQuests: QuestRun[]) => {
        this.prepareScoutQuests(scoutQuests);
        this.prepareQuestruns();
        this.prepareQuestTeams();
        this.filterQuestRuns();
        this.filterScoutsNotInQuest();
        this.renderScouts();
        this.dismissLoader();
      })
      .catch(err => {
        this.registerError(err);
        this.isLoading = false;
        this.dismissLoader();
      });
  }

  refreshData() {
    return this.questRunService
      .getAllFromQuest(this.questId)
      .then((scoutQuests: QuestRun[]) => {
        this.prepareScoutQuests(scoutQuests);
        this.prepareQuestruns();
        this.prepareQuestTeams();
        this.filterQuestRuns();
        this.filterScoutsNotInQuest();
        this.renderScouts();
      })
      .catch(err => {
        this.registerError(err);
      });
  }

  centerMapCaches() {
    const len = this.caches.length;
    let center: number[] = this.caches.map(cache => cache.location.coordinates).reduce(
      (x: number[], y: number[]) => {
        return [x[0] + y[0] / len, x[1] + y[1] / len];
      },
      [0, 0]
    );
    if (center[0] === 0 || center[1] === 0) return;
    this.map.panTo(latLng(center[0], center[1]));
  }

  onMapReady(map: Map) {
    this.map = map;
  }

  displayCoords(coords: number[]): string {
    if (coords.length < 2) return "Invalid coordinates";
    return `N ${coords[0]}º E ${coords[1]}º`;
  }

  // Renders caches markers on map
  renderCaches() {
    this.markers.map(mrkr => this.map.removeLayer(mrkr));
    if (this.showCaches) this.caches.map(cache => this.renderCache(cache));
  }

  // Render scouts on map
  renderScouts() {
    this.scoutMarkers.map(mrkr => this.map.removeLayer(mrkr));
    this.filteredScoutQuests.map(sQuest => sQuest.user).map(user => this.renderScout(user));
    //this.scoutQuests.map(sQuest => sQuest.user).map(user => this.renderScout(user));
  }

  calculateCompletionTime(run: QuestRun): number {
    return new Date(run.finishTime).getTime() - new Date(run.startTime).getTime();
  }

  getCompletionTime(run: QuestRun) {
    let duration = this.calculateCompletionTime(run);
    return (moment.duration(duration, "milliseconds") as any).format("H:mm:ss");
  }

  formatDuration(duration: number) {
    return (moment.duration(duration, "milliseconds") as any).format("H:mm:ss");
  }

  private renderCache(cache: ItemInstance) {
    if (cache.location == null || cache.location.coordinates == null) {
      return console.error("Invalid coordinates");
    }

    let markerIconHtml = `
    <div class="content-wrapper">
      <img src="${this.baseFileUrl}${
      cache.item.preview
    }" class="item-preview" style="max-width: 50px !important">
    </div>
    <div class="content-triangle"></div>
    `;

    if (cache.item.preview == null || !cache.item.preview.length) {
      markerIconHtml = `
      <div class="content-wrapper">
        <span class="item-name">${cache.name}</span>
      </div>
      <div class="content-triangle"></div>
      `;
    }

    const markerIcon = divIcon({
      className: "map-cache-marker",
      html: markerIconHtml,
      iconAnchor: [35, 91]
    });

    const cacheMarker = marker(cache.location.coordinates as any, {
      icon: markerIcon,
      draggable: false,
      title: cache.name,
      riseOnHover: true
    })
      .addTo(this.map)
      .on("click", e => {
        console.log("marker click");
      });
    this.markers.push(cacheMarker);
  }

  private renderScout(user: User) {
    if (user.currentLocation == null || user.currentLocation.coordinates == null) {
      return console.error("Invalid coordinates");
    }

    let markerIconHtml = `
    <div class="content-wrapper">
      <span class="item-name">${user.name}</span>
    </div>
    <div class="content-triangle"></div>
    `;

    const markerIcon = divIcon({
      className: "map-scout-marker",
      html: markerIconHtml,
      iconAnchor: [35, 91]
    });

    const scoutMarker = marker(user.currentLocation.coordinates as any, {
      icon: markerIcon,
      draggable: false,
      title: user.name,
      riseOnHover: true
    })
      .addTo(this.map)
      .on("click", e => {
        console.log("marker click");
      });
    this.scoutMarkers.push(scoutMarker);
  }
}
