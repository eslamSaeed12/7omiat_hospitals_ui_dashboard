import axiosClient from "./axios.base";

class logsClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async delete({ id }) {
    try {
      const client = this.client;
      return client.delete("/errors", { data: { id } });
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/errors")).data;
  }

  async find({ id }) {
    return (await this.client.get(`/errors/${id}`)).data;
  }
  
}

export default (jwt) => new logsClient(jwt);
