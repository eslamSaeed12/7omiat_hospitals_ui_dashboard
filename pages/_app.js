import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import App from "next/app";
import withRedux from "next-redux-wrapper";
import testReducer from "../reducers/main.js";
import Thunk from "redux-thunk";
import Head from "next/head";
const makeStore = (initialState, options) => {
  return createStore(testReducer, initialState, applyMiddleware(Thunk));
};

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    // we can dispatch from here too
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : { InitialStateModel };

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <>
        <Head></Head>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </>
    );
  }
}

export default withRedux(makeStore)(MyApp);
