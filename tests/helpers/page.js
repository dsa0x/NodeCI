const puppeteer = require("puppeteer");

const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  constructor(page) {
    this.page = page;
  }

  async login(path = "") {
    const user = await userFactory();
    1;
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto(`http://localhost:3000${path}`);
    await this.page.waitFor("a[href='/auth/logout']");
  }

  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    const allPages = new Proxy(customPage, {
      get: function(target, prop) {
        return target[prop] || browser[prop] || page[prop];
      }
    });
    return allPages;
  }

  async getContentsOf(sel) {
    return await this.page.$eval(sel, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());
    }, path);
  }
  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }
}

module.exports = CustomPage;
