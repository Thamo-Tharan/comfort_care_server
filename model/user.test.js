const mongoose = require("mongoose");
const UserModel = require("./user-model");

describe("UserModel", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/mydatabase");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  it("should create a new user", async () => {
    const user = new UserModel({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      mobilenumber: "555-555-1212",
      gender: "male",
      address: ["123 Main St", "Apt 4"],
    });

    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe("testuser");
    expect(savedUser.email).toBe("testuser@example.com");
    expect(savedUser.mobilenumber).toBe("555-555-1212");
    expect(savedUser.gender).toBe("male");
    expect(savedUser.address).toEqual(["123 Main St", "Apt 4"]);
  });

  it("should fail to create a user with missing required fields", async () => {
    const user = new UserModel({
      email: "testuser@example.com",
      password: "password123",
      mobilenumber: "555-555-1212",
    });

    let error = null;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain("Userschema validation failed");
  });

  it("should fail to create a user with duplicate email or username", async () => {
    const user1 = new UserModel({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      mobilenumber: "555-555-1212",
    });

    await user1.save();

    const user2 = new UserModel({
      username: "testuser",
      email: "testuser@example.com",
      password: "password456",
      mobilenumber: "555-555-1213",
    });

    let error = null;
    try {
      await user2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain("E11000 duplicate key error");
  });
});
