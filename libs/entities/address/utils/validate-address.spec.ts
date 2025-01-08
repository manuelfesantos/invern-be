import { validateStripeAddress } from "@address-entity";
import { errors } from "@error-handling-utils";

describe("validateStripeAddress", () => {
  it("should validate address", () => {
    const address = {
      line1: "123 Main Street",
      line2: "Apt 1",
      city: "San Francisco",
      country: "US",
      postal_code: "94105",
    };
    const expected = {
      line1: "123 Main Street",
      line2: "Apt 1",
      city: "San Francisco",
      country: "US",
      postalCode: "94105",
    };
    expect(validateStripeAddress(address)).toEqual(expected);
  });

  it("should throw error if address is missing", () => {
    expect(() => {
      validateStripeAddress(undefined);
    }).toThrow(errors.INVALID_ADDRESS("address is required"));
  });

  it("should throw error if address is not an object", () => {
    expect(() => {
      validateStripeAddress("address");
    }).toThrow(errors.INVALID_ADDRESS("address must be an object"));
  });

  it("should throw error if address.line1 is missing", () => {
    expect(() => {
      validateStripeAddress({
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address must have a line1"));
  });

  it("should throw error if address.line1 is invalid", () => {
    expect(() => {
      validateStripeAddress({
        line1: null,
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address line1 is required"));
  });

  it("should throw error if address.line1 is not a string", () => {
    expect(() => {
      validateStripeAddress({
        line1: 123,
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address.line1 must be a string"));
  });

  it("should throw error if address.city is missing", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address must have a city"));
  });

  it("should throw error if address.city is invalid", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: null,
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address.city is required"));
  });

  it("should throw error if address.city is not a string", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: 123,
        country: "US",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address.city must be a string"));
  });

  it("should throw error if address.countries is missing", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address must have a country"));
  });

  it("should throw error if address.countries is invalid", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        country: null,
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address country is required"));
  });

  it("should throw error if address.countries is not a string", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        country: 123,
        postal_code: "94105",
      });
    }).toThrow(errors.INVALID_ADDRESS("address country must be a string"));
  });

  it("should throw error if address.postal_code is missing", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
      });
    }).toThrow(errors.INVALID_ADDRESS("address must have a postal code"));
  });

  it("should throw error if address postal code is invalid", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
        postal_code: null,
      });
    }).toThrow(errors.INVALID_ADDRESS("address postal code is required"));
  });

  it("should throw error if address.postal_code is not a string", () => {
    expect(() => {
      validateStripeAddress({
        line1: "123 Main Street",
        line2: "Apt 1",
        city: "San Francisco",
        country: "US",
        postal_code: 123,
      });
    }).toThrow(errors.INVALID_ADDRESS("address postal code must be a string"));
  });
});
