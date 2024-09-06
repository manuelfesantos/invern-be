import { deleteImage } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteImage", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  it("should delete image", async () => {
    const imageUrl = "imageUrl";
    await deleteImage(imageUrl);
    expect(deleteSpy).toHaveBeenCalled();
  });
});
