function GetRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export interface Problem {
  num1: number;
  operator: string;
  num2: number;
  answer: number;
}

export class ProblemGenerator {
  private _numPlaces: number;
  private _carryChance: number;
  private _sign: "+" | "-" | "+-";
  public constructor(
    numPlaces: number,
    carryChance: number,
    sign: "+" | "-" | "+-"
  ) {
    this._numPlaces = numPlaces;
    this._carryChance = carryChance;
    this._sign = sign;
  }

  // Generate two number for addition with the given number of places and chance
  // of carrying each digit. The numbers can be manupulated to have a subtraction
  // problem with the same chance of regrouping digits.
  public GenerateNumbers(): [number, number] {
    let a = 0;
    let b = 0;
    let placeValue = 1;
    let carry = false;

    for (let i = 0; i < this._numPlaces; ++i) {
      let prevCarryValue = carry ? 1 : 0;

      carry = Math.random() < this._carryChance;

      let isHighestDigit = i + 1 == this._numPlaces;
      let minDigit = isHighestDigit ? 1 : 0;

      let maxSum = carry ? 19 : 9;
      let minSum = carry ? 10 : minDigit * 2 + prevCarryValue;
      let sum = GetRandomInteger(minSum, maxSum);
      let sumWithoutCarry = sum - prevCarryValue;

      let minADigit = Math.max(minDigit, sumWithoutCarry - 9);
      let maxADigit = Math.min(9, sumWithoutCarry);
      let aDigit = GetRandomInteger(minADigit, maxADigit);

      a += aDigit * placeValue;
      b += (sumWithoutCarry - aDigit) * placeValue;

      placeValue *= 10;
    }

    return [a, b];
  }

  public GenerateProblem(): Problem {
    let numbers = this.GenerateNumbers();
    let isAddition =
      this._sign == "+" || (this._sign == "+-" && Math.random() < 0.5);

    if (isAddition) {
      return {
        num1: numbers[0],
        operator: "+",
        num2: numbers[1],
        answer: numbers[0] + numbers[1]
      };
    } else {
      return {
        num1: numbers[0] + numbers[1],
        operator: "-",
        num2: numbers[0],
        answer: numbers[1]
      };
    }
  }
}
