import * as fs from "fs";
import * as path from "path";
import * as PDFDocument from "pdfkit";
import { DefaultsDeep } from "./defaults-deep";
import { Grid } from "./grid";
import { Problem, ProblemGenerator } from "./problem_generator";

function FloorWithTolerance(n: number): number {
  return Math.floor(n + 0.001);
}

function GetWidth(n: number): number {
  return n.toString().length;
}

function DrawNum(
  grid: Grid,
  num: number,
  x: number,
  y: number,
  w: number,
  color?: PDFKit.Mixins.ColorValue
): void {
  let s = num.toString();
  let left = w - s.length;
  for (let i = 0; i < s.length; ++i)
    grid.DrawChar(x + left + i, y, s[i], color);
}

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PDFProblemSetGeneratorOptions {
  numPlaces: number;
  sign: "+" | "-" | "+-"; // "+-" means mixed addition and subtraction
  carryChance: number;
  fontSize: number;
  paperSize: [number, number];
  margins: Margins;

  numQuestions: {
    num: number;
    unit: "question" | "page";
  };
}

export type PDFProblemSetGeneratorOptionsPartial = Partial<
  PDFProblemSetGeneratorOptions
>;

let defaultOptions: PDFProblemSetGeneratorOptions = {
  numPlaces: 2,
  sign: "+-",
  carryChance: 0.7,
  fontSize: 40,
  paperSize: [595.28, 841.89],
  margins: { top: 72, right: 72, bottom: 72, left: 72 },

  numQuestions: { num: 1, unit: "page" }
};

interface FontWithMetrics {
  name: string;
  data: Buffer;
  // Font metrics in thousandths of specified font size.
  width: number;
  height: number;
  vOffset: number;
  gridLineWidth: number;
  thickLineWidth: number;
  // Minimum size in pt when font size is small.
  minGridLineWidth: number;
  minThickLineWidth: number;
}

let fontData: { [x: string]: Readonly<FontWithMetrics> } = {};

function GetFontData(): FontWithMetrics {
  let fontName = "Liberation Sans";
  if (!fontData.hasOwnProperty(fontName)) {
    fontData[fontName] = {
      name: fontName,
      data: fs.readFileSync(
        path.join(__dirname, "../assets/LiberationSans-Regular.ttf")
      ),
      width: 800,
      height: 1100,
      vOffset: 0,
      gridLineWidth: 25,
      thickLineWidth: 75,
      minGridLineWidth: 0.5,
      minThickLineWidth: 1
    };
  }
  return fontData[fontName];
}

export class PDFProblemSetGenerator {
  private _writeStream: NodeJS.WritableStream;
  private _doc: PDFKit.PDFDocument;
  private _options: PDFProblemSetGeneratorOptions;
  private _font: FontWithMetrics;
  private _gridLineWidth: number;
  private _thickLineWidth: number;
  private _gridColor: PDFKit.Mixins.ColorValue;

  public constructor(
    writeStream: NodeJS.WritableStream,
    options: PDFProblemSetGeneratorOptionsPartial
  ) {
    this._writeStream = writeStream;
    console.log(options.numQuestions ? options.numQuestions.num : "undefined");
    this._options = DefaultsDeep(options, defaultOptions);
    console.log(this._options);

    this._doc = new PDFDocument({ autoFirstPage: false });
    this._doc.pipe(this._writeStream);

    this._font = GetFontData();
    // @ts-ignore: fontData is wrongly expected to be a string.
    this._doc.registerFont(this._font.name, this._font.data);
    this._gridLineWidth = Math.max(
      (this._options.fontSize * this._font.gridLineWidth) / 1000,
      this._font.minGridLineWidth
    );
    this._thickLineWidth = Math.max(
      (this._options.fontSize * this._font.thickLineWidth) / 1000,
      this._font.minThickLineWidth
    );

    this._gridColor = "#aaa";
  }

  public CloseAndFlush() {
    this._doc.end();
  }

  public LayoutFromFontSize(
    marginsOverride?: Partial<Margins>
  ): [number, number] {
    let margins = DefaultsDeep(marginsOverride || {}, this._options.margins);

    let gridX = FloorWithTolerance(
      ((this._options.paperSize[0] - margins.left - margins.right) * 1000) /
        (this._options.fontSize * this._font.width)
    );
    let gridY = FloorWithTolerance(
      ((this._options.paperSize[1] - margins.top - margins.bottom) * 1000) /
        (this._options.fontSize * this._font.height)
    );

    let hSpacing = 1;
    let vSpacing = 1;

    let questionWidth = this._options.numPlaces + 2;
    let questionHeight = 3;

    // Calculate the layout, but set to 1 if the result is 0.
    return [
      Math.max(1, Math.floor((gridX + hSpacing) / (questionWidth + hSpacing))),
      Math.max(1, Math.floor((gridY + vSpacing) / (questionHeight + vSpacing)))
    ];
  }

  public DrawProblem(
    grid: Grid,
    problem: Problem,
    x: number,
    y: number,
    w = 0
  ): void {
    let minWidth = Math.max(
      GetWidth(problem.num1),
      GetWidth(problem.num2),
      GetWidth(problem.answer)
    );
    w = Math.max(w, minWidth);
  
    DrawNum(grid, problem.num1, x, y, w);
  
    let operator = problem.operator == "-" ? "\u2212" : problem.operator;
    grid.DrawChar(x, y + 1, operator);
  
    DrawNum(grid, problem.num2, x, y + 1, w);
  
    grid.DrawLine(x, y + 2, x + w, y + 2, "black", this._thickLineWidth);
  }

  public AddFullPage(maxQuestion?: number): number {
    if (!maxQuestion) maxQuestion = 2 ** 31 - 1;
    this._doc.addPage({ size: this._options.paperSize });

    let [cols, rows] = this.LayoutFromFontSize();

    let hSpacing = 1;
    let vSpacing = 1;

    let questionWidth = this._options.numPlaces + 2;
    let questionHeight = 3;

    let grid = new Grid(
      this._doc,
      (questionWidth + hSpacing) * cols - hSpacing,
      rows * (questionHeight + vSpacing) - vSpacing,
      (this._options.fontSize * this._font.width) / 1000,
      (this._options.fontSize * this._font.height) / 1000,
      this._options.paperSize[0],
      this._options.paperSize[1],
      this._font.name,
      this._options.fontSize,
      (this._options.fontSize * this._font.vOffset) / 1000
    );
    grid.DrawGrid(this._gridColor, this._gridLineWidth);

    let generator = new ProblemGenerator(
      this._options.numPlaces,
      this._options.carryChance,
      this._options.sign
    );

    let questionsDrawn = 0;
    for (let y = 0; y < rows; ++y)
      for (let x = 0; x < cols; ++x) {
        if (questionsDrawn == maxQuestion) return questionsDrawn;
        this.DrawProblem(
          grid,
          generator.GenerateProblem(),
          x * (questionWidth + hSpacing),
          y * (questionHeight + vSpacing),
          questionWidth
        );
        questionsDrawn++;
      }
    return questionsDrawn;
  }

  public Write() {
    if (this._options.numQuestions.unit == "question") {
      let questionsRemaining = this._options.numQuestions.num;
      while (questionsRemaining > 0)
        questionsRemaining -= this.AddFullPage(questionsRemaining);
    } else {
      for (let i = 0; i < this._options.numQuestions.num; ++i)
        this.AddFullPage();
    }
  }
}
