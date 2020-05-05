import nextCookies from "next-cookies";
import jsCookie from "js-cookie";
import client from "./axios.base";
import Router from "next/router";
import serverCookie from "nookies";

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
  } catch (e) {
    if (ctx.res) {
      serverCookie.destroy(ctx, "META-AUTH-TOKEN", { path: "/" });
      ctx.res.writeHead(302, { Location: "/panel/login" });
      ctx.res.end();
    } else {
      jsCookie.remove("META-AUTH-TOKEN", { path: "/" });
      Router.push("/panel/login");
    }
  }
}
