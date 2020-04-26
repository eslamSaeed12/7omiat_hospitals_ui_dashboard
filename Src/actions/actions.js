import { fetches } from "../helpers/fetch.lengths";

const FetchDataStatus = (payload) => {
  return {
    type: "FETCH_DATA_STATUS",
    payload,
  };
};

const FetchDataAsync = (payload) => {
  return {
    type: "FETCH_DATA",
    payload,
  };
};

const FetchDataFailure = (payload) => {
  return {
    type: "FETCH_DATA_FAILURE",
    payload,
  };
};

export const FETCH_DATA = ({ jwt_token }) => {
  return (dispatch) => {
    fetches(jwt_token)
      .then((e) => {
        if (e instanceof Error) {
          throw Error(e);
        }
        dispatch(FetchDataAsync(e));
        dispatch(FetchDataStatus(false));
      })
      .catch((e) => {
        dispatch(FetchDataFailure(e.message));
      });
  };
};

export const AUTHENTICATE_LOGIN = (payload) => {
  return {
    type: "AUTHENTICATION_LOGIN",
    payload,
  };
};

export const FetchUserInformation = (payload) => {
  return {
    type: "FETCH_USER_INFO",
    payload,
  };
};
