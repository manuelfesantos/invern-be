import { Collection, CollectionDetails } from "@collection-entity";
import { productsMock } from "./product";

export const collectionsMock: Collection[] = [
  {
    collectionId: "e1947e1d-1519-4baf-91aa-52780b3840a3",
    collectionName: "collection 1",
    images: {
      url: "http://url1.com",
      alt: "alt1",
    },
  },
  {
    collectionId: "b95c2837-3b68-49a5-b6a4-41cbfdba39b7",
    collectionName: "collection 2",
    images: {
      url: "http://url2.com",
      alt: "alt2",
    },
  },
  {
    collectionId: "30f5f76c-889a-4fce-81d8-5ef4b948772b",
    collectionName: "collection 3",
    images: {
      url: "http://url3.com",
      alt: "alt3",
    },
  },
];

export const collectionDetailsMock: CollectionDetails = {
  collectionId: "e1947e1d-1519-4baf-91aa-52780b3840a3",
  collectionName: "collection 1",
  description: "description 1",
  products: productsMock,
};
