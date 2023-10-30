export class Grid {
  private _doc: PDFKit.PDFDocument;
  private _rows: number;
  private _cols: number;
  private _cellWidth: number;
  private _cellHeight: number;
  private _totalWidth: number;
  private _totalHeight: number;

  private _left: number;
  private _top: number;
  private _right: number;
  private _bottom: number;

  private _fontName: string;
  private _fontSize: number;
  private _vOffset: number;

  public constructor(
    doc: PDFKit.PDFDocument,
    cols: number,
    rows: number,
    cellWidth: number,
    cellHeight: number,
    pageWidth: number,
    pageHeight: number,
    fontName: string,
    fontSize: number,
    vOffset = 0
  ) {
    this._doc = doc;
    this._rows = rows;
    this._cols = cols;
    this._cellWidth = cellWidth;
    this._cellHeight = cellHeight;

    this._totalWidth = cellWidth * cols;
    this._totalHeight = cellHeight * rows;

    // Center align grid
    this._left = (pageWidth - this._totalWidth) * 0.5;
    this._top = (pageHeight - this._totalHeight) * 0.5;
    this._right = this._left + this._totalWidth;
    this._bottom = this._top + this._totalHeight;

    this._fontName = fontName;
    this._fontSize = fontSize;
    this._vOffset = vOffset;
  }

  public AbsX(x: number): number {
    return this._left + this._cellWidth * x;
  }
  public AbsY(y: number): number {
    return this._top + this._cellHeight * y;
  }

  public AbsCoord(x: number, y: number): { x: number; y: number } {
    return {
      x: this.AbsX(x),
      y: this.AbsY(y)
    };
  }

  public DrawGrid(
    color: PDFKit.Mixins.ColorValue = "#777",
    lineWidth = 1
  ): void {
    this._doc.lineWidth(lineWidth);

    this._doc
      .rect(this._left, this._top, this._totalWidth, this._totalHeight)
      .stroke(color);

    for (let r = 1; r < this._rows; ++r) {
      let y = this.AbsY(r);
      this._doc
        .moveTo(this._left, y)
        .lineTo(this._right, y)
        .stroke(color);
    }

    for (let c = 1; c < this._cols; ++c) {
      let x = this.AbsX(c);
      this._doc
        .moveTo(x, this._top)
        .lineTo(x, this._bottom)
        .stroke(color);
    }
  }

  public DrawChar(
    x: number,
    y: number,
    char: string,
    color: PDFKit.Mixins.ColorValue = "black"
  ): void {
    this._doc
      .font(this._fontName)
      .fontSize(this._fontSize)
      .fillColor(color);
    this._doc.text(char, this.AbsX(x), this.AbsY(y) + this._vOffset, {
      width: this._cellWidth,
      align: "center"
    });
  }

  public DrawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: PDFKit.Mixins.ColorValue,
    lineWidth: number
  ): void {
    this._doc
      .lineWidth(lineWidth)
      .moveTo(this.AbsX(x1), this.AbsY(y1))
      .lineTo(this.AbsX(x2), this.AbsY(y2))
      .stroke(color);
  }
}
