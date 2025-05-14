import { Timestamp, type FirestoreDataConverter } from "firebase/firestore";

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
  createdAt?: Date;
  updatedAt?: Date;
}

export const clientConverter: FirestoreDataConverter<Client> = {
  toFirestore: (client) => ({
    fullname: client.fullname,
    email: client.email,
    phone: client.phone,
    address: client.address,
    createdAt: client.createdAt
      ? Timestamp.fromDate(client.createdAt as Date)
      : Timestamp.now(),
    updatedAt: client.updatedAt
      ? Timestamp.fromDate(client.updatedAt as Date)
      : Timestamp.now(),
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
      updatedAt: data.createdAt.toDate(),
    };
  },
};
