const Page = require("./helpers/page");

// to make sure it's globally scoped in the file
let page;

beforeEach(async () => {
  page = await Page.build();

  //open new tab
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", () => {
  beforeEach(async () => {
    await page.login("/blogs");
    await page.click(".fixed-action-btn a");
  });

  test("Can see block create form", async () => {
    const formLabel = await page.getContentsOf("form label");
    expect(formLabel).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type("div.title input", "My Title");
      await page.type("div.content input", "My Content");
      await page.click("form button");
    });

    test("submitting takes user to a review screen", async () => {
      const text = await page.getContentsOf("form h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("The form shows an error message", async () => {
      const titleErr = await page.getContentsOf(".title .red-text");
      const contentErr = await page.getContentsOf(".content .red-text");

      expect(titleErr).toEqual("You must provide a value");
      expect(contentErr).toEqual("You must provide a value");
    });
  });
});

describe("User is not logged in", async () => {
  test("User cannot create blog posts", async () => {
    // const result = await page.evaluate(() => {
    //   return fetch("/api/blogs", {
    //     method: "POST",
    //     credentials: "same-origin",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ title: "My Title", content: "My Content" })
    //   }).then(res => res.json());
    // });
    const result = await page.post("/api/blogs", { title: "T", content: "C" });

    expect(result).toEqual({ error: "You must log in!" });
  });
  test("User cannot view blog posts", async () => {
    // const result = await page.evaluate(() => {
    //   return fetch("/api/blogs", {
    //     method: "GET",
    //     credentials: "same-origin",
    //     headers: { "Content-Type": "application/json" }
    //   }).then(res => res.json());
    // });
    const result = await page.get("/api/blogs");
    expect(result).toEqual({ error: "You must log in!" });
  });
});
