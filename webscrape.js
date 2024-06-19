const { chromium } = require("playwright");
const cheerio = require("cheerio");

class WebScraperService {
  constructor() {
    this.browser = null;
  }

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
  }

  async validateAndLoadPage(url, page) {
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      throw new PageLoadError("Invalid URL");
    }

    let loadedPage;
    try {
      loadedPage = await page.goto(url, {
        waitUntil: "domcontentloaded",
      });
    } catch (error) {
      throw new PageLoadError("Failed to load page");
    }

    if (!loadedPage) {
      throw new PageLoadError("Failed to load page");
    }
  }

  async getCompanySiteData(url) {
    console.log(`Crawling ${url}`);
    try {
      await this.initializeBrowser();
      const context = await this.browser.newContext();
      const page = await context.newPage();

      await this.validateAndLoadPage(url, page);
      const html = await page.content();

      const $ = cheerio.load(html);
      const tagsToExtract = [
        "span",
        "div",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "li",
        "a",
        "ol",
        "ul",
      ];
      let content = "";
      tagsToExtract.forEach((tag) => {
        $(tag).each((_, element) => {
          content += $(element).text() + " ";
        });
      });

      content = content.slice(0, 5000);
      content = content
        .replace(/\.\w+/g, "")
        .replace(/(.)\1/g, "")
        .replace(/#\S/g, "")
        .replace(/-\w+/g, "")
        .replace(/\s+/g, " ");

      await context.close();
      return content;
    } catch (error) {
      console.error("Error in getCompanySiteData:", error);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async getCompanySiteScreenshot(url) {
    console.log(`Crawling ${url}`);
    try {
      await this.initializeBrowser();
      const context = await this.browser.newContext({
        viewport: { width: 1200, height: 1200 },
      });
      const page = await context.newPage();
      await this.validateAndLoadPage(url, page);

      const buffer = await page.screenshot();
      await context.close();
      return buffer.toString("base64");
    } catch (error) {
      console.error("Error in getCompanySiteScreenshot:", error);
      return "Failed to scrape the website";
    } finally {
      await this.closeBrowser();
    }
  }
}

class PageLoadError extends Error {
  constructor(message) {
    super(message);
    this.name = "PageLoadError";
  }
}

module.exports = WebScraperService;
