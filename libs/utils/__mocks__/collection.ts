import { Collection, CollectionDetails } from "@collection-entity";
import { productsMock } from "./product";

export const collectionsMock: Collection[] = [
  {
    id: "e1947e1d-1519-4baf-91aa-52780b3840a3",
    name: "collection 1",
    image: {
      url: "http://url1.com",
      alt: "alt1",
    },
  },
  {
    id: "b95c2837-3b68-49a5-b6a4-41cbfdba39b7",
    name: "collection 2",
    image: {
      url: "http://url2.com",
      alt: "alt2",
    },
  },
  {
    id: "30f5f76c-889a-4fce-81d8-5ef4b948772b",
    name: "collection 3",
    image: {
      url: "http://url3.com",
      alt: "alt3",
    },
  },
];

export const collectionDetailsMock: CollectionDetails = {
  id: "e1947e1d-1519-4baf-91aa-52780b3840a3",
  name: "collection 1",
  description: "description 1",
  products: productsMock,
};
