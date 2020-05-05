import axiosClient from "./axios.base";

class roleClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async create({ title }) {
    try {
      const client = this.client;
      const newRole = client.post("/role", { title });
      return newRole;
    } catch (e) {
      return e.response;
    }
  }
  async update({ title, id }) {
    try {
      const client = this.client;
      const newRole = client.patch("/role", { title, id });
      return newRole;
    } catch (e) {
      return e.response;
    }
  }

  async delete({ id }) {
    try {
      const client = this.client;
      const deleted = client.delete("/role", { data: { id } });
      return deleted;
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/role")).data;
  }
}

export default (jwt) => new roleClient(jwt);
