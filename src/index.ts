import * as fs from "fs";
import {
  PDFProblemSetGenerator,
  PDFProblemSetGeneratorOptionsPartial
} from "./pdf_problem_set_generator";

function CreatePDFAsFile(
  filename: string,
  options?: PDFProblemSetGeneratorOptionsPartial
): void {
  let generator = new PDFProblemSetGenerator(
    fs.createWriteStream(filename),
    options || {}
  );

  generator.Write();
  generator.CloseAndFlush();
}

CreatePDFAsFile("worksheet.pdf");
