import { Component } from "react";
import * as validator from "validator";
import { easeCubic } from "d3-ease";
import ReactMapGL, {
  Layer,
  Source,
  setRTLTextPlugin,
  NavigationControl,
  FlyToInterpolator,
} from "react-map-gl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  FormControl,
  MenuItem,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
class Map extends Component {
  state = {
    flyTo: [],
    viewport: {
      width: "100%",
      height: "400px",
      latitude: 30.306908,
      longitude: 31.732813,
      zoom: 13,
      transitionDuration: 0,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: easeCubic,
    },
  };

  componentDidMount() {
    setRTLTextPlugin(
      // find out the latest version at https://www.npmjs.com/package/@mapbox/mapbox-gl-rtl-text
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      null,
      // lazy: only load when the map first encounters Hebrew or Arabic text
      true
    );
  }
  render() {
    if (this.props.data) {
      return (
        <Box position="relative">
          <ReactMapGL
            mapStyle="mapbox://styles/eslam-saeed12/ck9sr896v04ao1jqf26qzafle"
            mapboxApiAccessToken={this.props.token}
            onViewportChange={(viewport) => {
              this.setState({ viewport });
            }}
            {...this.state.viewport}
          >
            <Source type="geojson" data={this.props.data}>
              <Layer {...this.props.layerStyle} />
            </Source>
            <div
              style={{ position: "absolute", right: "0.5rem", top: "0.5rem" }}
            >
              <NavigationControl />
            </div>

            <Box
              style={{
                position: "absolute",
                left: "0.5rem",
                top: "0.5rem",
              }}
            >
              <Card style={{ zIndex: 111111 }}>
                <CardContent>
                  <Typography>اختر المستشفي</Typography>
                  <FormControl>
                    <Select
                      style={{ marginTop: "8px" }}
                      variant="outlined"
                      value={this.state.flyTo}
                      onChange={(v) => {
                        const cords = v.target.value;
                        if (
                          validator.default.isLatLong(cords.join(",") || "")
                        ) {
                          this.setState({ flyTo: cords });
                          this.setState({
                            viewport: {
                              ...this.state.viewport,
                              latitude: cords[1],
                              longitude: cords[0],
                              zoom: 15,
                              transitionDuration: 1000,
                            },
                          });
                          setTimeout(() => {
                            this.setState({
                              viewport: {
                                ...this.state.viewport,
                                transitionDuration: 150,
                              },
                            });
                          }, 1000);
                        }
                      }}
                    >
                      {this.props.data.features.map((point, id) => {
                        return (
                          <MenuItem
                            value={point.geometry.coordinates}
                            key={id.toString()}
                          >
                            {point.properties.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
          </ReactMapGL>
        </Box>
      );
    }
    return <Skeleton variant="rect" height="600px" />;
  }
}

export default Map;
