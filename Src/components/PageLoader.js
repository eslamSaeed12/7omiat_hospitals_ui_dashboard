import { HashLoader } from "react-spinners";
import { Component } from "react";
import { Typography } from "@material-ui/core";

class Loader extends Component {
  LoaderStyle = {
    zIndex: 5555,
    backgroundColor: "#000",
    width: "100%",
    height: "100vh",
  };
  loaderItemStyle = {
    position: "fixed",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
  };
  render() {
    return (
      <div style={this.LoaderStyle}>
        <div
          style={{
            ...this.loaderItemStyle,
            left: this.props.left ? this.props.left : "50vw",
            top: this.props.top ? this.props.top : "40vh",
          }}
        >
          <div style={{ alignSelf: "center" }}>
            <HashLoader color={this.props.color} size={this.props.size} />
          </div>
          <div>
            <Typography style={{ color: "#f8f8f8", marginTop: "5px" }}>
              {this.props.content ? this.props.content : "جاري التحميل"}
            </Typography>
          </div>
        </div>
      </div>
    );
  }
}

export default Loader;
