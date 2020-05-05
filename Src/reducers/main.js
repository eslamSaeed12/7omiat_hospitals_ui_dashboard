export const initialState = {
  fetch_api_data_isLoading: true,
  fetch_api_data: {},
  fetch_api_data_error: "",
  auth_token_api: "",
  authUserLoad: false,
  authUser: {},
  authUserErorr: "",
};

export function mainReducer(state = initialState, action) {
  if (action.type === "FETCH_DATA_STATUS") {
    return {
      ...state,
      fetch_api_data_isLoading: action.payload,
    };
  }

  if (action.type === "FETCH_DATA") {
    return {
      ...state,
      fetch_api_data: action.payload,
    };
  }

  if (action.type === "FETCH_DATA_FAILURE") {
    const handleErorrMessage = () => {
      const asARRAY = String(action.payload).split(":");
      return asARRAY[1];
    };
    return {
      ...state,
      fetch_api_data_error: handleErorrMessage().trim(),
    };
  }

  if (action.type === "AUTHENTICATION_LOGIN") {
    return {
      ...state,
      auth_token_api: action.payload,
    };
  }

  if (action.type === "FETCH_USER_DONE") {
    return {
      ...state,
      authUserLoad: true,
    };
  }

  if (action.type === "FETCH_USER_INFO") {
    return {
      ...state,
      authUser: action.payload.data,
    };
  }

  if (action.type === "FETCH_USER_FAIL") {
    return {
      ...state,
      authUserErorr: action.payload,
    };
  }

  return state;
}
