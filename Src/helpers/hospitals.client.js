import axiosClient from "./axios.base";

class hospitalClient {
  constructor(jwt) {
    this.client = axiosClient(jwt);
  }

  async find({ id }) {
    return await this.client.get(`/hospitals/${id}`);
  }

  async create({
    name,
    telephone,
    fullDescription,
    coords,
    gov_id,
    created_by,
  }) {
    try {
      const client = this.client;
      const hospital = client.post("/hospitals", {
        name,
        telephone,
        fullDescription,
        coords,
        gov_id,
        created_by,
      });
      return hospital;
    } catch (e) {
      return e.response;
    }
  }
  async update({
    id,
    name,
    telephone,
    fullDescription,
    coords,
    gov_id,
    updated_by,
  }) {
    try {
      const client = this.client;
      const newhospital = client.patch("/hospitals", {
        id,
        name,
        telephone,
        fullDescription,
        coords,
        gov_id,
        updated_by,
      });
      return newhospital;
    } catch (e) {
      return e.response;
    }
  }

  async delete({ id }) {
    try {
      const client = this.client;
      const deleted = client.delete("/hospitals", { data: { id } });
      return deleted;
    } catch (e) {
      return e.response;
    }
  }

  async findAll() {
    return (await this.client.get("/hospitals")).data;
  }
}

export default (jwt) => new hospitalClient(jwt);
