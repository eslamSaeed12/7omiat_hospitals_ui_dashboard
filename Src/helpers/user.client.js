import axiosClient from "./axios.base";

class userClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async find({ id }) {
    return await this.client.get(`/user/${id}`);
  }

  async create({ username, password, email, role_id }) {
    try {
      const client = this.client;
      const newuser = client.post("/user", {
        username,
        password,
        email,
        role_id,
      });
      return newuser;
    } catch (e) {
      return e.response;
    }
  }
  async update({ username, password, email, role_id, id }) {
    try {
      const client = this.client;
      const newuser = client.patch("/user", {
        username,
        password,
        email,
        role_id,
        id,
      });
      return newuser;
    } catch (e) {
      return e.response;
    }
  }

  async updateProfile({ username, password, email, id }) {
    try {
      const client = this.client;
      const newuser = client.patch("/user", {
        username,
        password,
        email,
        id,
      });
      return newuser;
    } catch (e) {
      return e.response;
    }
  }

  async delete({ id }) {
    try {
      const client = this.client;
      const deleted = client.delete("/user", { data: { id } });
      return deleted;
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/user")).data;
  }
}

export default (jwt) => new userClient(jwt);
