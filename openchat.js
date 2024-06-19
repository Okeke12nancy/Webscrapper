const { OpenAI } = require("openai");
require("dotenv").config();
const errorResponseHandler = require("./handler");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({ key: process.env.OPENAI_API_KEY });
  }

  async summarizeAndAnalyze(company_desc, company_name, res = null) {
    try {
      const airesponse = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
              The text content of the landing page of a company website was extracted.
              The company name is ${company_name}, and the text content scraped from the landing page is ${company_desc}.
              ---
              1. Summarize what the company does according to the following rules:
                  - Make a complete description
                  - Make it in English
                  - Start with the name of the company
                  - Make it in 3rd person
              2. If the text content is blank, null, or undefined:
                  - Set summary to 'set company description manually, we could not extract it'
                  - Set sector to 'Produits et services industriels'
                  - Set keywords to any two words related to a company
              `,
          },
        ],
        model: "gpt-3.5-turbo-1106",
        temperature: 0.1,
        n: 1,
      });

      return airesponse.choices[0].message.content;
    } catch (error) {
      console.error("Error from OpenAI API:", error);

      if (res) {
        const errorMessage =
          error.response?.data?.error?.message || "Internal Server Error";
        const errorCode = error.response?.status || 500;
        errorResponseHandler(
          errorCode,
          `OpenAI API Error: ${errorMessage}`,
          null,
          res
        );
      } else {
        throw error;
      }
    }
  }
}

module.exports = OpenAIService;
