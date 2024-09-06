import { updateImage } from "./update";
import * as DB from "@db";
import { imagesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateImage", () => {
  const setSpy = jest.spyOn(DB.db().update(imagesTable), "set");
  it("should update image", async () => {
    const imageUrl = "imageUrl";
    const changes = {
      alt: "alt",
    };
    await updateImage(imageUrl, changes);
    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
