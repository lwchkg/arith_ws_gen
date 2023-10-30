<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" md="6">
        <b-jumbotron
          header="Math Worksheet"
          header-level="4"
          lead="Generate addition and subtraction worksheets in vertical form."
          style="padding: 1rem 2rem"
        />

        <b-form-group horizontal label="Number of Places"
                      :label-cols="labelcols"
                      :label-size="inputsize"
                      description="The number of places of the two smaller numbers. These are the underlined numbers in the following: <u>56</u>&nbsp;+&nbsp;<u>78</u>&nbsp;=&nbsp;134 and 134&nbsp;−&nbsp;<u>56</u>&nbsp;=&nbsp;<u>78</u>.">
          <b-input-group :size="inputsize" :append="options.numPlaces.toString()">
            <b-input :size="inputsize" type="range" min="1" max="5" step="1" v-model.number="options.numPlaces"/>
          </b-input-group>
        </b-form-group>

        <b-form-group horizontal label="Operation"
                      :label-cols="labelcols"
                      :label-size="inputsize"
                      description="Addition, subtraction or mixed calculations.">
          <b-form-radio-group buttons
                              button-variant="outline-primary"
                              :size="inputsize"
                              v-model="options.sign"
                              :options="radioOptions.signOptions" />
        </b-form-group>

        <b-form-group horizontal label="Carry / Borrow Chance"
                      :label-cols="labelcols"
                      :label-size="inputsize"
                      description="The chance that carrying and borrowing to occur per digit.">
          <b-input-group :size="inputsize" :append="options.carryChance * 100 + '%'">
            <b-input :size="inputsize" type="range" min="0" max=".7" step=".1" v-model.number="options.carryChance"/>
          </b-input-group>
        </b-form-group>

        <b-form-group horizontal label="Number of Questions"
                      :label-cols="labelcols"
                      :label-size="inputsize"
                      description="Enter the number of questions or pages.">
          <b-input-group :size="inputsize">
            <b-input-group-prepend>
              <b-button variant="as-inputgroup" v-on:click="numQStepDown">&minus;</b-button>
            </b-input-group-prepend>
            <b-form-input id="numQ" type="number" min="1" required v-model.number="options.numQuestions.num"/>
            <b-input-group-append>
              <b-button variant="as-inputgroup" v-on:click="numQStepUp">+</b-button>
              <b-form-radio-group buttons
                                  button-variant="outline-primary"
                                  :size="inputsize"
                                  v-model="options.numQuestions.unit"
                                  :options="radioOptions.numQuestionsUnit" />
            </b-input-group-append>
          </b-input-group>          
        </b-form-group>

        <b-form-group horizontal label="Font Size"
                      :label-cols="labelcols"
                      :label-size="inputsize"
                      description="Font size. Larger font size = less questions per page.">
          <b-input-group :size="inputsize" :append="options.fontSize">
            <b-input :size="inputsize" type="range" min="10" max="99" step="1" v-model.number="options.fontSize"/>
          </b-input-group>
        </b-form-group>

        <b-button :size="inputsize" variant="success" v-on:click="generate">
          Generate Worksheet
        </b-button>
      </b-col>
      <b-col cols="12" md="6" style="padding: 0">
        <iframe id="worksheet"
                :src="pdfURL"
                style="position: absolute; width: 100%; height: 100vh; border: none" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import { CreateAsBlobURL } from "../../website";
import { PDFProblemSetGeneratorOptionsPartial } from "../../pdf_problem_set_generator";

declare var PDFProblemSet: {
  CreateAsBlobURL: typeof CreateAsBlobURL
};

let options: PDFProblemSetGeneratorOptionsPartial = {
  carryChance: 0.7,
  fontSize: 40,
  numPlaces: 2,
  numQuestions: { num: 1, unit: "page" },
  sign: "+-"
};

export default Vue.extend({
  data: () => ({
    inputsize: "lg",
    labelcols: 3,
    options: options,
    pdfURL: "about:blank",
    radioOptions: {
      numQuestionsUnit: [
        { text: "page(s)", value: "page" },
        { text: "question(s)", value: "question" }
      ],
      signOptions: [
        { text: "+", value: "+" },
        { text: "\u2212", value: "-" },
        { text: "mixed", value: "+-" }
      ]
    }
  }),
  methods: {
    generate: function(): void {
      let self = this;
      function onPDFURLFinish(url: string): void {
        self.pdfURL = url;
      }
      PDFProblemSet.CreateAsBlobURL(onPDFURLFinish, this.options);
    },
    numQStepDown: function(): void {
      (document.getElementById("numQ") as HTMLInputElement).stepDown();
    },
    numQStepUp: function(): void {
      (document.getElementById("numQ") as HTMLInputElement).stepUp();
    }
  }
});
</script>
