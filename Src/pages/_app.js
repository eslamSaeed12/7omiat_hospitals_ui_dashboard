import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import App from "next/app";
import withRedux from "next-redux-wrapper";
import { mainReducer, initialState } from "../reducers/main";
import Thunk from "redux-thunk";
import Head from "next/head";
import "../../public/sass/main.scss";
import { create } from "jss";
import rtl from "jss-rtl";
import ReduxLogger from "redux-logger";
import {
  CssBaseline,
  StylesProvider,
  NoSsr,
  ThemeProvider,
  createMuiTheme,
  jssPreset,
} from "@material-ui/core";

const makeStore = (initialState, options) => {
  return createStore(
    mainReducer,
    initialState,
    applyMiddleware(Thunk, ReduxLogger)
  );
};

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    // we can dispatch from here too

    // here i can get the cookie from fetching it

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : { ...initialState };

    return { pageProps };
  }

  theme = createMuiTheme({
    direction: "rtl",
    typography: {
      fontFamily: "bahij",
    },
  });

  rtl(props) {
    const jss = create({ plugins: [...jssPreset().plugins, rtl()] });
    return <StylesProvider jss={jss}>{props.children}</StylesProvider>;
  }

  render() {
    const { Component, pageProps, store } = this.props;
    const RTL = this.rtl;
    return (
      <>
        <Provider store={store}>
          <Head>
            <link
              href="https://api.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css"
              rel="stylesheet"
            />
          </Head>
          <RTL>
            <NoSsr>
              <ThemeProvider theme={this.theme}>
                <CssBaseline />
                <Component {...pageProps} />
              </ThemeProvider>
            </NoSsr>
          </RTL>
        </Provider>
      </>
    );
  }
}

export default withRedux(makeStore)(MyApp);
