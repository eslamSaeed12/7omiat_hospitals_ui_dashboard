import * as _ from "lodash";
import cookies from "js-cookie";
import validator from "validator";
import * as GeoJSON from "geojson";
class utils {
  constructor() {
    this._ = _;
    this.co = cookies;
    this.v = validator;
    this.parser = GeoJSON;
  }

  isCoords(coords) {
    try {
      const { v } = this;
      if (!Array.isArray(coords)) {
        return false;
      }

      if (!v.isLatLong(coords.join(","))) {
        return false;
      }

      return true;
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.log(e);
      return false;
    }
  }

  flattenCoords(coordsCollection) {
    try {
      const { _ } = this;
      if (!coordsCollection)
        throw new Error("hospiatlas data collection is required");
      if (!Array.isArray(coordsCollection)) {
        throw new Error("coordsCollection  data should be array");
      }
      const flatCollection = _.flatMap(coordsCollection, (collection) => {
        return {
          lat: collection.coords.coordinates[0],
          lon: collection.coords.coordinates[1],
          telephone: collection.telephone,
          addresse: collection.fullDescription,
          name: collection.name,
        };
      });

      return flatCollection;
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.log(e);
      return e;
    }
  }

  flyTo() {}

  parseGeoJson(flatenCollection) {
    try {
      if (!flatenCollection) {
        throw new Error("flatten collection data is required");
      }
      if (!Array.isArray(flatenCollection)) {
        throw new Error("flatten collection data should be array");
      }
      const { parser } = this;

      const parsedPoints = parser.parse(flatenCollection, {
        Point: ["lat", "lon"],
      });
      return parsedPoints;
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.log(e);
      return e;
    }
  }
}

export default () => new utils();
