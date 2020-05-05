import axiosClient from "./axios.base";

class logsClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async delete({ id }) {
    try {
      const client = this.client;
      return client.delete("/logs", { data: { id } });
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/logs")).data;
  }

  async find({ id }) {
    return (await this.client.get(`/logs/${id}`)).data;
  }
}

export default (jwt) => new logsClient(jwt);
