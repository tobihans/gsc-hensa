import type { FirestoreDataConverter } from "firebase/firestore";

export interface Client {
  uid?: string;
  fullname: string;
  email: string;
  phone: string;
  address:
    | {
        country: string;
        city: string;
        street: string;
        postalCode: string;
      }
    | string;
  createdAt: Date;
}

export namespace ClientRouter {
  export interface LoaderData {
    clients: Client[];
  }
}

export const clientConverter: FirestoreDataConverter<Client> = {
  toFirestore: (client) => ({
    fullname: client.fullname,
    email: client.email,
    phone: client.phone,
    address: client.address,
    createdAt: client.createdAt,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return {
      uid: snapshot.id,
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      address: `${data.address.postalCode}, ${data.address.street}, ${data.address.city}, ${data.address.country}`,
      createdAt: data.createdAt.toDate(),
    };
  },
};
