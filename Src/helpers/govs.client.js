import axiosClient from "./axios.base";

class govsClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async create({ name, created_by }) {
    try {
      const client = this.client;
      const newGov = client.post("/gov", { name, created_by });
      return newGov;
    } catch (e) {
      return e.response;
    }
  }
  async update({ name, created_by, id, updated_by = null }) {
    try {
      const client = this.client;
      const newGov = client.patch("/gov", {
        name,
        created_by,
        id,
        updated_by,
      });
      return newGov;
    } catch (e) {
      return e.response;
    }
  }

  async delete({ id }) {
    try {
      const client = this.client;
      const deleted = client.delete("/gov", { data: { id } });
      return deleted;
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/gov")).data;
  }
}

export default (jwt) => new govsClient(jwt);
