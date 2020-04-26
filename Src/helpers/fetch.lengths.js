import axiosBase from "./axios.base";

export const fetches = async (jwt) => {
  let Data;
  try {
    const http = axiosBase(jwt);
    const users = await (await http.get("/user")).data;
    const roles = await (await http.get("/role")).data;
    const hospitals = await (await http.get("/hospitals")).data;
    const govs = await (await http.get("/gov")).data;

    Data = {
      users,
      roles,
      hospitals,
      govs,
    };
    return Data;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
    if (e.message === "Network Error") {
      return Error("لا يوجد اتصال بالخادم , تاكد من الاتصال بالانترنت");
    }

    return Error(e);
  }
};
