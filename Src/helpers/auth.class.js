import axios from "axios";
class auth {
  static async login({ email, password }) {
    try {
      if (!email) throw new Error("email is required");
      if (!password) throw new Error("password is required");

      if (typeof email !== "string") throw new Error("email should be string");
      if (typeof password !== "string")
        throw new Error("password should be string");

      const fetchJWT = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      return fetchJWT.data;
    } catch (e) {
      if (process.env["NODE_ENV"]) {
        console.log(e);
      }

      if (e.isAxiosError) {
        return { error: "البيانات المدخله لا تطابق اي حساب" };
      }

      return { error: "حدث خطأ ما .. سنعمل علي اصلاحه في اقرب وقت" };
    }
  }
}

export default auth;
