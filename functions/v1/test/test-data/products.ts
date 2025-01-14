import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { productsTable } from "@schema";
import { InsertProduct } from "@product-entity";

const getProductsList = (): InsertProduct[] => [
  {
    name: "Earth Jar",
    collectionId: "Erosion",
    description: "Earth Jar 20 'riven', unglazed stoneware",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Raku Fire",
    collectionId: "Erosion",
    description: "Watershed' hand formed, raku fired ceramic",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Saggar Bottle",
    collectionId: "Erosion",
    description: "Erosion bottle of saggar fired stoneware",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Strata Flask",
    collectionId: "Erosion",
    description:
      "A small hand made strata flask with dark iron tenmoku glazed interior.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Erosion Cup",
    collectionId: "Midden",
    description:
      "A hand made erosion cup (or yunomi) with iron matt glaze interior.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Tanka Fired",
    collectionId: "Midden",
    description:
      "Tanka fired strata vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Strata Flask",
    collectionId: "Midden",
    description:
      "A small hand made strata flask with dark iron tenmoku glazed interior.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Strata Vase",
    collectionId: "Midden",
    description:
      "Tanka fired strata vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Rolling Erosion",
    collectionId: "Contour",
    description:
      "Rolling erosion bowl. This textured hand made bowl has been fired in a charcoal saggar in the wood kiln where it takes on the soft greys and blacks from the firing process.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Contour Vase",
    collectionId: "Contour",
    description:
      "Contour vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Strata Flask",
    collectionId: "Contour",
    description:
      "A small hand made strata flask with dark iron tenmoku glazed interior.",
    priceInCents: 500,
    stock: 2,
  },
  {
    name: "Kappa Vase",
    collectionId: "Contour",
    description:
      "Kappa vase bowl. This textured hand made bowl has been fired in a charcoal saggar in the wood kiln where it takes on the soft greys and blacks from the firing process.",
    priceInCents: 500,
    stock: 2,
  },
];

export const insertProducts = async (
  collections: {
    collectionId: string;
    name: string;
  }[],
): Promise<{ productId: string; name: string }[]> => {
  const productsList = getProductsList();
  return db()
    .insert(productsTable)
    .values(
      productsList.map((product) => ({
        ...product,
        collectionId: getCollectionId(collections, product.collectionId),
        id: getRandomUUID(),
      })),
    )
    .returning({
      productId: productsTable.id,
      name: productsTable.name,
    });
};

const getCollectionId = (
  collections: { collectionId: string; name: string }[],
  name: string,
): string => {
  const collectionId = collections.find(
    (collection) => collection.name === name,
  )?.collectionId;
  if (!collectionId) {
    throw new Error("Collection not found");
  }
  return collectionId;
};
