/**
 * Image management: upload validation (content-type allow-list + size limit,
 * never trusting the client), and the CRUD guards — update/delete 404 when the
 * record is missing, the empty-update short-circuit, and delete removing BOTH
 * the D1 row and its R2 object so storage never leaks. DB actions and the R2
 * image client are mocked.
 */
jest.mock("@image-db", () => ({
  __esModule: true,
  ...jest.requireActual("@image-db"),
  getInsertImageAction: jest.fn(),
  getUpdateImageAction: jest.fn(),
  getDeleteImageAction: jest.fn(),
  getSelectImageByUrlAction: jest.fn(),
}));
jest.mock("@r2-adapter", () => ({
  __esModule: true,
  ...jest.requireActual("@r2-adapter"),
  imageClient: { upload: jest.fn(), delete: jest.fn() },
}));

import {
  getInsertImageAction,
  getUpdateImageAction,
  getDeleteImageAction,
  getSelectImageByUrlAction,
} from "@image-db";
import { imageClient } from "@r2-adapter";
import { uploadImage } from "../../libs/modules/image/use-cases/upload-image";
import { createImage } from "../../libs/modules/image/use-cases/create-image";
import { updateImage } from "../../libs/modules/image/use-cases/update-image";
import { deleteImage } from "../../libs/modules/image/use-cases/delete-image";
import { withTestContext } from "../harness";

const insert = getInsertImageAction as unknown as jest.Mock;
const update = getUpdateImageAction as unknown as jest.Mock;
const del = getDeleteImageAction as unknown as jest.Mock;
const selByUrl = getSelectImageByUrlAction as unknown as jest.Mock;
const upload = imageClient.upload as jest.Mock;
const r2delete = imageClient.delete as jest.Mock;

const URL = "https://images.invernspirit.com/abc.png";
const PRODUCT_ID = "2fef20d6-4fa9-461a-8acb-ba87c3e15c5e";
const RECORD = { url: URL, alt: "a", productId: PRODUCT_ID, isThumbnail: false };

const actionReturning = (value: unknown) => ({
  run: () => Promise.resolve(value),
});

const pngFile = (bytes = 4, type = "image/png") =>
  new File([new Uint8Array(bytes)], "whatever.png", { type });

beforeEach(() => {
  insert.mockReset().mockReturnValue(actionReturning({ url: URL }));
  update.mockReset().mockReturnValue(actionReturning(undefined));
  del.mockReset().mockReturnValue(actionReturning(undefined));
  selByUrl.mockReset().mockReturnValue(actionReturning(RECORD));
  upload.mockReset().mockResolvedValue(URL);
  r2delete.mockReset().mockResolvedValue(undefined);
});

describe("uploadImage (validation)", () => {
  it("stores an allowed image and returns its hosted URL", async () => {
    await expect(withTestContext(() => uploadImage(pngFile()))).resolves.toEqual({
      url: URL,
    });
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("rejects when no File is provided", async () => {
    await expect(
      withTestContext(() => uploadImage(undefined)),
    ).rejects.toThrow();
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects a disallowed content type", async () => {
    await expect(
      withTestContext(() => uploadImage(pngFile(4, "text/plain"))),
    ).rejects.toThrow();
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects an empty file", async () => {
    await expect(
      withTestContext(() => uploadImage(pngFile(0))),
    ).rejects.toThrow();
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects a file over the 5MB limit", async () => {
    await expect(
      withTestContext(() => uploadImage(pngFile(5 * 1024 * 1024 + 1))),
    ).rejects.toThrow();
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("createImage", () => {
  it("inserts the record and returns the re-selected row", async () => {
    await expect(
      withTestContext(() => createImage(RECORD)),
    ).resolves.toEqual(RECORD);
    expect(insert).toHaveBeenCalledTimes(1);
  });
});

describe("updateImage (guards)", () => {
  it("throws when the record does not exist", async () => {
    selByUrl.mockReturnValue(actionReturning(undefined));
    await expect(
      withTestContext(() => updateImage({ url: URL, alt: "x" })),
    ).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  it("does not issue a DB write when only the url is provided", async () => {
    await withTestContext(() => updateImage({ url: URL }));
    expect(update).not.toHaveBeenCalled();
  });

  it("updates the editable fields when present", async () => {
    await withTestContext(() => updateImage({ url: URL, alt: "new" }));
    expect(update).toHaveBeenCalledWith(URL, { alt: "new" });
  });
});

describe("deleteImage (record + R2 object)", () => {
  it("throws when the record does not exist", async () => {
    selByUrl.mockReturnValue(actionReturning(undefined));
    await expect(withTestContext(() => deleteImage(URL))).rejects.toThrow();
    expect(del).not.toHaveBeenCalled();
    expect(r2delete).not.toHaveBeenCalled();
  });

  it("deletes the D1 row AND the R2 object so storage never leaks", async () => {
    await withTestContext(() => deleteImage(URL));
    expect(del).toHaveBeenCalledWith(URL);
    expect(r2delete).toHaveBeenCalledWith(URL);
  });
});
