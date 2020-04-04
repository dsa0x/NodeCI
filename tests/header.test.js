const Page = require("./helpers/page");

let page;

// jest.setTimeout(30000);

beforeEach(async () => {
  //Almost All puppeteer functions are asynchronous
  //   browser = await puppeteer.launch({
  //     headless: false
  //   });
  //   //open browser
  //   page = await browser.newPage();

  page = await Page.build();

  //open new tab
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("The header has the correct text", async () => {
  // const text = await page.$eval("a.brand-logo", el => el.innerHTML);
  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toContain("https://accounts.google.com/");
});

test("When signed in, shows logout button", async () => {
  await page.login();

  const text = await page.getContentsOf("a[href='/auth/logout']");
  expect(text).toEqual("Logout");
});
