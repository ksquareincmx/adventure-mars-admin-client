import { Component, NgZone } from "@angular/core";
import { App, ModalController, NavParams } from "ionic-angular";
import { AlertController, ToastController, LoadingController } from "ionic-angular";
import { BasePage } from "./../../components/base-page/base-page";
import { MenuStorage } from "../../providers/menu-storage/menu-storage";
import { EditItemInstancePage } from "../edit-item-instance/edit-item-instance";
import { EditCachePage } from "../edit-cache/edit-cache";

import { Quest, QuestService } from "../../providers/quest";
import { ItemInstance, ItemInstanceService } from "../../providers/item-instance";
import { Item, ItemService } from "../../providers/item";
import { AuthProvider } from "../../providers/auth-provider/auth-provider";
import { tileLayer, latLng, Map, marker, divIcon } from "leaflet";

// Global variable, should be available in scope
declare var urlsServerConfig: any;

@Component({
  selector: "page-quest",
  templateUrl: "quest.html"
})
export class QuestPage extends BasePage {
  isLoading: boolean = false;

  questId: number = null;
  quest: Quest = new Quest();
  caches: ItemInstance[] = [];
  items: Item[] = [];

  map: any = null;
  markers: any[] = [];

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
    public itemService: ItemService,
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
    let questId = this.navParams.get("questId");
    if (questId != null) this.questId = questId;
    console.log(this.quest, this.questId);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.load(true, null);
  }

  appResumed() {
    this.load(true, null);
  }

  ionViewCanLeave() {
    if (!this.quest.dirty) {
      return true;
    } else {
      const title = "There are unsaved changes";
      const message = "If you leave the view, changes will be lost, are you sure?";

      return this.showConfirmAlertPromise(title, message);
    }
  }

  refresh() {
    if (!this.quest.dirty) {
      return this.load(true, null);
    }
    this.showConfirmAlertPromise("Unsaved changes", "Do you want to discard the changes?").then(
      confirm => {
        if (confirm) {
          return this.load(true, null);
        }
      }
    );
  }

  load(show: boolean, refresher: any) {
    this.isLoading = true;
    this.presentLoader();
    return this.itemService
      .getAll()
      .then((items: Item[]) => {
        this.items = items;
        if (this.questId == null) return this.quest; // No quest to load
        return this.questService.get(this.questId);
      })
      .then(quest => {
        this.quest = quest;
        if (this.questId == null) return []; // No itemInstances to load
        return this.itemInstanceService.getFromQuest(this.quest.id);
      })
      .then((caches: ItemInstance[]) => {
        this.caches = caches;
        this.isLoading = false;
        this.renderCaches();
        this.centerMapCaches();
        this.dismissLoader();
      })
      .catch(err => {
        this.registerError(err);
        this.isLoading = false;
        this.dismissLoader();
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

  add() {
    if (this.map == null) return;

    const mapCenter = this.map.getCenter();
    const coords = [mapCenter.lat, mapCenter.lng];
    this.openInstanceModal(
      {
        items: this.items,
        questId: this.quest.id,
        unitId: this.auth.getUnitId(),
        location: { type: "Point", coordinates: coords } // Set to center of the map by default
      },
      true
    );
  }

  edit(cache: ItemInstance) {
    // this.openInstanceModal(
    //   {
    //     itemInstance: cache,
    //     items: this.items
    //   },
    //   false
    // );

    let editCacheModal = this.modalCtrl.create(EditCachePage, { cache });
    editCacheModal.onDidDismiss(data => {
      if (data == null) return;
      let idx = this.caches.findIndex(cache => cache.id === data.id);
      if (idx > -1) this.caches[idx] = data;
      this.renderCaches();
      this.setDirty();
    });
    editCacheModal.present();
  }

  private openInstanceModal(
    data: {
      itemInstance?: ItemInstance;
      items: Item[];
      questId?: number;
      unitId?: number;
      location?: any;
    },
    isNew: boolean
  ) {
    let itemInstanceModal = this.modalCtrl.create(EditItemInstancePage, data);
    itemInstanceModal.onDidDismiss(data => {
      if (data == null) return;
      if (isNew) this.caches.push(data);
      else {
        let idx = this.caches.findIndex(cache => cache.id === data.id);
        if (idx > -1) this.caches[idx] = data;
      }
      this.renderCaches();
      this.setDirty();
    });
    itemInstanceModal.present();
  }

  save() {
    this.presentLoader();
    this.questService
      .save(this.quest)
      .then((res: Quest) => {
        this.quest = res;
        this.questId = this.quest.id;
        return this.saveCaches();
      })
      .then((caches: ItemInstance[]) => {
        this.dismissLoader();
        this.load(true, null);
      })
      .catch(err => {
        console.error(err);
        this.dismissLoader();
      });
  }

  saveCaches(): Promise<ItemInstance[]> {
    const promises = this.caches.map((cache: ItemInstance) => {
      // Set quest Id, IMPORTANT for new quests
      cache.questId = this.quest.id;
      return this.itemInstanceService.save(cache);
    });
    return Promise.all(promises);
  }

  setDirty() {
    this.quest.dirty = true;
  }

  delete(cache: ItemInstance) {
    this.showConfirmAlertPromise("Are you sure?", "Deleting a Cache cannot be undone").then(
      (response: boolean) => {
        if (!response) return;
        if (!cache.isFilled()) {
          // Cache is not saved, only remove from list
          const index = this.caches.indexOf(cache);
          if (index > -1) {
            this.caches.splice(index, 1);
          }
          this.renderCaches();
          return;
        }
        this.itemInstanceService
          .delete(cache)
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

  setPause(paused: boolean) {
    this.quest.paused = paused;
    this.save();
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
    this.caches.map(cache => this.renderCache(cache));
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
      draggable: true,
      title: cache.name,
      riseOnHover: true
    })
      .addTo(this.map)
      .on("click", e => {})
      .on("dragend", e => {
        const newCoords = e.target._latlng;
        this.zone.run(() => {
          cache.location.coordinates = [newCoords.lat, newCoords.lng];
          this.setDirty();
        });
      });
    this.markers.push(cacheMarker);
  }
}
