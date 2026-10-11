/**
 * Four preset scenarios for one-click demos. Each sets the quick-form fields
 * plus the plot-details fields and the shared "answer as on" date, then the
 * caller (App.tsx) auto-submits — no new matching or geometry logic here,
 * just data that drives the existing form state.
 */
import type { FormState, PlotDetailsFormState } from './formState'
import type { Bi } from './types'

export interface DemoScenario {
  id: string
  title: Bi
  description: Bi
  asOf: string
  form: FormState
  plotDetailsForm: PlotDetailsFormState
}

const TODAY_POST_AMENDMENT = '2026-10-11'

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'standard',
    title: { en: '200 sq m Residential Plot, 9 m Road', hi: '200 वर्ग मी आवासीय भूखंड, 9 मी सड़क' },
    description: {
      en: 'Standard rule lookup and visual setbacks',
      hi: 'मानक नियम खोज एवं दृश्य सेटबैक',
    },
    asOf: TODAY_POST_AMENDMENT,
    form: { plotArea: '200', roadWidth: '9', use: 'residential', zone: '', proposedFloors: '', topics: [] },
    plotDetailsForm: {
      plotWidth: '10', plotDepth: '20', roadFacing: 'north',
      proposedFrontSetback: '', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
    },
  },
  {
    id: 'amendment',
    title: { en: '450 sq m Plot, 9 m Road — Aug 2026 Amendment', hi: '450 वर्ग मी भूखंड, 9 मी सड़क — अग 2026 संशोधन' },
    description: {
      en: 'Demonstrates the amendment overriding the March 2025 record',
      hi: 'संशोधन द्वारा मार्च 2025 अभिलेख के अधिक्रमण का प्रदर्शन',
    },
    asOf: TODAY_POST_AMENDMENT,
    form: { plotArea: '450', roadWidth: '9', use: 'residential', zone: '', proposedFloors: '', topics: [] },
    plotDetailsForm: {
      plotWidth: '15', plotDepth: '30', roadFacing: 'south',
      proposedFrontSetback: '', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
    },
  },
  {
    id: 'violation',
    title: { en: 'Potential Violation', hi: 'संभावित उल्लंघन' },
    description: {
      en: 'Proposed front setback is lower than required — map shows a red violation area',
      hi: 'प्रस्तावित फ्रंट सेटबैक आवश्यक मान से कम — मानचित्र लाल उल्लंघन क्षेत्र दिखाता है',
    },
    asOf: TODAY_POST_AMENDMENT,
    form: { plotArea: '200', roadWidth: '9', use: 'residential', zone: '', proposedFloors: '', topics: [] },
    plotDetailsForm: {
      plotWidth: '10', plotDepth: '20', roadFacing: 'east',
      proposedFrontSetback: '1.5', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
    },
  },
  {
    id: 'missing',
    title: { en: 'Missing Details', hi: 'अधूरी जानकारी' },
    description: {
      en: 'Focused clarifying prompts instead of guessed values',
      hi: 'अनुमानित मान के बजाय केंद्रित स्पष्टीकरण अनुरोध',
    },
    asOf: TODAY_POST_AMENDMENT,
    form: { plotArea: '200', roadWidth: '', use: '', zone: '', proposedFloors: '', topics: [] },
    plotDetailsForm: {
      plotWidth: '', plotDepth: '', roadFacing: '',
      proposedFrontSetback: '', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
    },
  },
]
