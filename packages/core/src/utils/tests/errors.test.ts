// Copyright ©, 2026-present, Lightspark Group, Inc. - All Rights Reserved

import { errorToJSON } from "../errors.js";

describe("errorToJSON", () => {
  it("preserves the receiver for custom toJSON methods", () => {
    class SerializableError extends Error {
      toJSON() {
        return { name: this.name, message: this.message };
      }
    }

    const error = new SerializableError("Marker failed");

    expect(errorToJSON(error)).toEqual({
      name: "Error",
      message: "Marker failed",
    });
  });
});
