import { Deck, MapView } from "@deck.gl/core";
import { BitmapLayer, GeoJsonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { ParticleLayer } from "deck.gl-particle";

import { MAPBOX_TILE } from "./constants/environment";

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

const particleBaseUrl = `https://wind-tiles.s3.amazonaws.com/[YEAR]/[MONTH]/[DATE]/[HOUR]/wind_data.png`;

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let mapMode = params.map || "transparent";
let numParticles = params.numParticles ? Number(params.numParticles) : 5000;
let maxAge = params.maxAge ? Number(params.maxAge) : 60;
let speedFactor = params.speedFactor ? Number(params.speedFactor) : 1;
let visibleParticle = true;
let bearing = params.bearing ? Number(params.bearing) : 0;
let pitch = params.pitch ? Number(params.pitch) : 0;
let latitude = params.lat ? Number(params.lat) : 31.952162238024975;
let longitude = params.lon ? Number(params.lon) : -95.97656249999999;
let zoom = params.zoom ? Number(params.zoom) : 7;

let selectedDate = new Date(
  `${params.year}-${String(params.month).padStart(2, "0")}-${String(
    params.date
  ).padStart(2, "0")}T${String(params.hour).padStart(2, "0")}:00:00.000Z`
);

if (!isValidDate(selectedDate)) {
  selectedDate = new Date();
}

const year = String(selectedDate.getUTCFullYear());
const month = String(selectedDate.getUTCMonth() + 1).padStart(2, "0");
const date = String(selectedDate.getUTCDate()).padStart(2, "0");
const hour = String(selectedDate.getUTCHours()).padStart(2, "0");

const particleImageUrl = particleBaseUrl
  .replace("[YEAR]", year)
  .replace("[MONTH]", month)
  .replace("[DATE]", date)
  .replace("[HOUR]", hour);
const mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

export const deck = new Deck({
  initialViewState: {
    latitude,
    longitude,
    zoom,
    bearing,
    pitch,
  },
  controller: {
    normalize: false,
  },
  views: [new MapView({ id: "map1", repeat: true })],
  onDragStart: (info, event) => {
    numParticles = 0;
    maxAge = 0;
    render();
    return true;
  },
  onDragEnd: (info, event) => {
    numParticles = params.numParticles ? Number(params.numParticles) : 5000;
    maxAge = params.maxAge ? Number(params.maxAge) : 60;
    render();
    return true;
  },
  onInteractionStateChange: (interactionState) => {
    const { isZooming, isPanning } = interactionState;
    if (isZooming || isPanning) {
      numParticles = 0;
      maxAge = 0;
      visibleParticle = false;
    } else {
      numParticles = params.numParticles ? Number(params.numParticles) : 5000;
      maxAge = params.maxAge ? Number(params.maxAge) : 60;
      visibleParticle = true;
    }
    render();
  },

  useDevicePixels: false,
  _animate: true,
  _pickable: true,
  _typedArrayManagerProps: mobileCheck() ? { overAlloc: 1, poolSize: 0 } : null,
});

function render() {
  const layers = [
    new GeoJsonLayer({
      id: "basemap",
      data: "../assets/common/world.json",
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [160, 160, 180, 200],
      getLineColor: (d) => colorToRGBArray(d.properties.color),
      getPointRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
      visible: String(mapMode).toLowerCase() === "geojson",
    }),
    new TileLayer({
      id: "basemapbox",
      data: MAPBOX_TILE,
      minZoom: 0,
      tileSize: 256,
      renderSubLayers: (props) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile;
        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
      visible: String(mapMode).toLowerCase() === "mapbox",
    }),
    new ParticleLayer({
      id: "particle",
      image: particleImageUrl,
      numParticles,
      maxAge,
      speedFactor,
      color: [255, 255, 255],
      width: 1,
      opacity: 0.2,
      visible: visibleParticle,
    }),
  ];

  deck.setProps({ layers });
}

render();

export const moveView = function (newViewState) {
  longitude = newViewState.longitude ? newViewState.longitude : longitude;
  latitude = newViewState.latitude ? newViewState.latitude : latitude;
  zoom = newViewState.zoom ? newViewState.zoom : zoom;
  bearing = newViewState.bearing ? newViewState.bearing : bearing;
  pitch = newViewState.pitch ? newViewState.pitch : pitch;
  deck.setProps({
    initialViewState: {
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
    },
  });
  console.log("ismoved");
};

// For automated test cases
/* global document */
document.body.style.margin = "0px";
// document.body.style.backgroundColor = "transparent";
