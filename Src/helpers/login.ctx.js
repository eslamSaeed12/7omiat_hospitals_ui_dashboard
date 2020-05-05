import nextCookies from "next-cookies";
import jsCookie from "js-cookie";
import client from "./axios.base";
import cookieServer from "nookies";
import Router from "next/router";

export async function validAuth({ ctx }) {
  try {

    let token;
    if (ctx.req) {
      // server side ya3ny
      const cookiesLoader = nextCookies(ctx);
      const jwtCookie = cookiesLoader["META-AUTH-TOKEN"];
      token = jwtCookie;
    } else if (!ctx.req) {
      token = jsCookie.get("META-AUTH-TOKEN");
    }
    const resp = await client(token).post(`/auth`);
    if (resp.status === 200) {
      if (ctx.res) {
        ctx.res.writeHead(302, { Location: "/panel/home" });
        ctx.res.end();
      } else {
        Router.push("/panel/home");
      }
    }
  } catch (e) {
    if (ctx.res) {
      cookieServer.destroy(ctx, "META-AUTH-TOKEN", { path: "/" });
    } else {
      jsCookie.remove("META-AUTH-TOKEN", { path: "/" });
    }
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
  }
}
