import * as blobStream from "blob-stream";
import {
  PDFProblemSetGenerator,
  PDFProblemSetGeneratorOptionsPartial
} from "./pdf_problem_set_generator";

function CreateAsBlobStream(
  options?: PDFProblemSetGeneratorOptionsPartial
): blobStream.IBlobStream {
  let stream = blobStream();
  let generator = new PDFProblemSetGenerator(stream, options || {});
  generator.Write();
  generator.CloseAndFlush();
  return stream;
}

export function CreateAsBlob(
  callback: (blob: Blob) => void,
  options?: PDFProblemSetGeneratorOptionsPartial
): void {
  let stream = CreateAsBlobStream(options);
  stream.on("finish", function() {
    callback(stream.toBlob("application/pdf"));
  });
}

export function CreateAsBlobURL(
  callback: (blobURL: string) => void,
  options?: PDFProblemSetGeneratorOptionsPartial
): void {
  let stream = CreateAsBlobStream(options);
  stream.on("finish", function() {
    callback(stream.toBlobURL("application/pdf"));
  });
}

/* eslint typescript/prefer-namespace-keyword: "off" */
declare global {
  interface Window {
    PDFProblemSet: any;
  }
}

window.PDFProblemSet = exports;
