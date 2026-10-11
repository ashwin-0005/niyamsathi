import type { Bi, ComplianceStatus, Lang, RoadFacing, Topic, Use } from './types'

export const TOPIC_LABEL: Record<Topic, Bi> = {
  front_setback: { en: 'Front setback', hi: 'फ्रंट सेटबैक' },
  side_setback: { en: 'Side setback', hi: 'साइड सेटबैक' },
  rear_setback: { en: 'Rear setback', hi: 'रियर सेटबैक' },
  far: { en: 'FAR', hi: 'एफ.ए.आर.' },
  ground_coverage: { en: 'Ground coverage', hi: 'भूतल आच्छादन' },
  max_floors: { en: 'Maximum floors', hi: 'अधिकतम तल' },
  fee: { en: 'Permission fee', hi: 'अनुज्ञा शुल्क' },
}

export const USE_LABEL: Record<Use, Bi> = {
  residential: { en: 'Residential', hi: 'आवासीय' },
  commercial: { en: 'Commercial', hi: 'वाणिज्यिक' },
  mixed: { en: 'Mixed use', hi: 'मिश्रित उपयोग' },
}

export const FIELD_LABEL: Record<string, Bi> = {
  plotArea: { en: 'Plot area', hi: 'भूखंड क्षेत्रफल' },
  roadWidth: { en: 'Road width', hi: 'सड़क की चौड़ाई' },
  use: { en: 'Building use', hi: 'भवन उपयोग' },
  zone: { en: 'Zone / locality', hi: 'क्षेत्र / मोहल्ला' },
  proposedFloors: { en: 'Proposed floors', hi: 'प्रस्तावित तल' },
  plotWidth: { en: 'Plot width', hi: 'भूखंड चौड़ाई' },
  plotDepth: { en: 'Plot depth', hi: 'भूखंड गहराई' },
  roadFacing: { en: 'Road-facing direction', hi: 'सड़क की दिशा' },
  proposedFrontSetback: { en: 'Proposed front setback', hi: 'प्रस्तावित फ्रंट सेटबैक' },
  proposedRearSetback: { en: 'Proposed rear setback', hi: 'प्रस्तावित रियर सेटबैक' },
  proposedLeftSetback: { en: 'Proposed left setback', hi: 'प्रस्तावित बायाँ सेटबैक' },
  proposedRightSetback: { en: 'Proposed right setback', hi: 'प्रस्तावित दायाँ सेटबैक' },
}

export const ROAD_FACING_LABEL: Record<RoadFacing, Bi> = {
  north: { en: 'North', hi: 'उत्तर' },
  south: { en: 'South', hi: 'दक्षिण' },
  east: { en: 'East', hi: 'पूर्व' },
  west: { en: 'West', hi: 'पश्चिम' },
}

export const COMPLIANCE_STATUS_LABEL: Record<ComplianceStatus, Bi> = {
  match: { en: 'Preliminary rule match', hi: 'प्रारंभिक नियम मिलान' },
  needs_input: { en: 'More information required', hi: 'अधिक जानकारी आवश्यक' },
  violation: { en: 'Potential rule violation', hi: 'संभावित नियम उल्लंघन' },
  officer_review: { en: 'Officer review required', hi: 'अधिकारी समीक्षा आवश्यक' },
}

const S = {
  appName: { en: 'NiyamSathi', hi: 'नियमसाथी' },
  tagline: { en: 'Bhopal Building Rules Assistant', hi: 'भोपाल भवन नियम सहायक' },
  subtitle: {
    en: 'MP Bhumi Vikas Rules, 2012 — rule-backed answers for building permission clerks',
    hi: 'म.प्र. भूमि विकास नियम, 2012 — भवन अनुज्ञा लिपिकों हेतु नियम-आधारित उत्तर',
  },
  demoBanner: {
    en: 'Demo dataset — every value below is seeded placeholder data. Verify against the official record before issuing any permission.',
    hi: 'डेमो डेटासेट — नीचे दिया प्रत्येक मान प्रारूपिक (प्लेसहोल्डर) डेटा है। कोई भी अनुज्ञा जारी करने से पूर्व आधिकारिक अभिलेख से सत्यापित करें।',
  },
  askTab: { en: 'Ask a question', hi: 'प्रश्न पूछें' },
  formTab: { en: 'Quick form', hi: 'त्वरित फॉर्म' },
  explorerTab: { en: 'Rule explorer', hi: 'नियम सूची' },
  placeholder: {
    en: 'e.g. 200 sq m residential plot on a 9 m road. What front setback is required?',
    hi: 'उदा. 200 वर्ग मीटर के प्लॉट और 9 मीटर सड़क के लिए फ्रंट सेटबैक कितना है?',
  },
  examples: { en: 'Try an example', hi: 'उदाहरण आज़माएँ' },
  getAnswer: { en: 'Get rule-backed answer', hi: 'नियम-आधारित उत्तर पाएँ' },
  clear: { en: 'Clear', hi: 'साफ़ करें' },
  understood: { en: 'What I read from your question', hi: 'आपके प्रश्न से क्या समझा गया' },
  notFound: { en: 'not stated', hi: 'नहीं बताया गया' },
  editFields: { en: 'Edit these in the quick form', hi: 'त्वरित फॉर्म में बदलें' },
  results: { en: 'Answer', hi: 'उत्तर' },
  verifiedMatch: { en: 'Verified rule match', hi: 'सत्यापित नियम मिलान' },
  demoMatch: { en: 'Demo rule match — verify against official record', hi: 'डेमो नियम मिलान — आधिकारिक अभिलेख से सत्यापित करें' },
  needsInput: { en: 'More information needed', hi: 'और जानकारी आवश्यक' },
  noRule: { en: 'No rule found in the dataset', hi: 'डेटासेट में कोई नियम नहीं मिला' },
  ambiguous: { en: 'More than one row matches — refer to the Building Officer', hi: 'एक से अधिक प्रविष्टियाँ मेल खाती हैं — भवन अधिकारी को संदर्भित करें' },
  noRuleHelp: {
    en: 'This combination of inputs is not covered by any row in the loaded dataset. Do not quote a value. Refer to the printed rulebook or the Building Permission Branch.',
    hi: 'लोड किए गए डेटासेट की किसी भी प्रविष्टि में इनपुट का यह संयोजन शामिल नहीं है। कोई मान उद्धृत न करें। मुद्रित नियम पुस्तिका अथवा भवन अनुज्ञा शाखा से संपर्क करें।',
  },
  needsInputHelp: { en: 'Provide the following to get an exact rule match:', hi: 'सटीक नियम मिलान हेतु निम्नलिखित दें:' },
  source: { en: 'Source', hi: 'स्रोत' },
  page: { en: 'page', hi: 'पृष्ठ' },
  version: { en: 'Version', hi: 'संस्करण' },
  effective: { en: 'Effective', hi: 'प्रभावी' },
  appliesWhen: { en: 'Applies when', hi: 'कब लागू' },
  openExcerpt: { en: 'Open source excerpt', hi: 'स्रोत उद्धरण खोलें' },
  hideExcerpt: { en: 'Hide source excerpt', hi: 'स्रोत उद्धरण छिपाएँ' },
  exactWording: { en: 'Exact source wording', hi: 'स्रोत का यथावत् पाठ' },
  placeholderText: {
    en: 'Placeholder text — not reproduced from the gazette. Replace with the verified excerpt.',
    hi: 'प्रारूपिक पाठ — राजपत्र से प्रतिलिपित नहीं। सत्यापित उद्धरण से प्रतिस्थापित करें।',
  },
  calculated: { en: 'Calculated from the cited rule', hi: 'उद्धृत नियम से गणना' },
  changed: { en: 'Changed by amendment', hi: 'संशोधन द्वारा परिवर्तित' },
  unchanged: { en: 'Re-notified, value unchanged', hi: 'पुनः अधिसूचित, मान अपरिवर्तित' },
  previously: { en: 'Previous position', hi: 'पूर्व स्थिति' },
  caution: { en: 'Check before issuing', hi: 'जारी करने से पूर्व जाँचें' },
  asOf: { en: 'Answer as on', hi: 'उत्तर इस तिथि पर' },
  asOfHelp: { en: 'Set an earlier date to see the position before the amendment.', hi: 'संशोधन से पूर्व की स्थिति देखने हेतु पहले की तिथि चुनें।' },
  copy: { en: 'Copy answer', hi: 'उत्तर कॉपी करें' },
  copied: { en: 'Copied', hi: 'कॉपी हो गया' },
  print: { en: 'Print', hi: 'प्रिंट' },
  topicsAsked: { en: 'Topics', hi: 'विषय' },
  allTopics: { en: 'All topics', hi: 'सभी विषय' },
  rows: { en: 'rows', hi: 'प्रविष्टियाँ' },
  searchRules: { en: 'Search rule, table or condition…', hi: 'नियम, तालिका या शर्त खोजें…' },
  value: { en: 'Value', hi: 'मान' },
  note: { en: 'Note', hi: 'टिप्पणी' },
  footer: {
    en: 'NiyamSathi is a decision-support aid. It does not replace the MP Bhumi Vikas Rules, 2012 or the authority of the Building Permission Branch.',
    hi: 'नियमसाथी एक निर्णय-सहायक साधन है। यह म.प्र. भूमि विकास नियम, 2012 अथवा भवन अनुज्ञा शाखा के अधिकार का स्थान नहीं लेता।',
  },
  answeredIn: { en: 'Answered from local verified dataset', hi: 'स्थानीय सत्यापित डेटासेट से उत्तर' },
  required: { en: 'required', hi: 'आवश्यक' },
  optional: { en: 'optional', hi: 'वैकल्पिक' },
  anyTopic: { en: 'Requested topic', hi: 'वांछित विषय' },
  submitForm: { en: 'Check rules', hi: 'नियम देखें' },
  select: { en: 'select', hi: 'चुनें' },
  unitSqm: { en: 'sq m', hi: 'वर्ग मीटर' },
  unitM: { en: 'metres', hi: 'मीटर' },

  mapTitle: { en: 'Visual Plot Compliance Map', hi: 'दृश्य भूखंड अनुपालन मानचित्र' },
  mapIllustrative: {
    en: 'Illustrative plot layout — enter plot dimensions for an accurate footprint.',
    hi: 'उदाहरणात्मक भूखंड आरेख — सटीक रूपरेखा हेतु भूखंड के आयाम दर्ज करें।',
  },
  mapRoadUnknown: { en: 'Road width not provided — shown at a placeholder thickness', hi: 'सड़क की चौड़ाई नहीं दी गई — अनुमानित मोटाई दिखाई गई' },
  mapNoFootprint: {
    en: 'The mandatory setbacks consume the entire plot — no buildable footprint remains. Officer review required.',
    hi: 'अनिवार्य सेटबैक पूरे भूखंड को घेर लेते हैं — कोई निर्माण योग्य क्षेत्र शेष नहीं है। अधिकारी समीक्षा आवश्यक।',
  },
  legendBuildable: { en: 'Buildable area', hi: 'निर्माण योग्य क्षेत्र' },
  legendSetback: { en: 'Mandatory open / setback area', hi: 'अनिवार्य खुला / सेटबैक क्षेत्र' },
  legendViolation: { en: 'Proposed construction violation', hi: 'प्रस्तावित निर्माण उल्लंघन' },
  legendUnknown: { en: 'Information needed', hi: 'जानकारी आवश्यक' },
  legend: { en: 'Legend', hi: 'सूचक' },
  roadLabel: { en: 'Road', hi: 'सड़क' },
  plotDimensionsLabel: { en: 'Plot dimensions', hi: 'भूखंड के आयाम' },
  clickZoneHint: { en: 'Click or hover a zone for its rule citation', hi: 'नियम उद्धरण हेतु किसी क्षेत्र पर क्लिक अथवा होवर करें' },
  zoneFront: { en: 'Front setback zone', hi: 'फ्रंट सेटबैक क्षेत्र' },
  zoneRear: { en: 'Rear setback zone', hi: 'रियर सेटबैक क्षेत्र' },
  zoneLeft: { en: 'Left setback zone', hi: 'बायाँ सेटबैक क्षेत्र' },
  zoneRight: { en: 'Right setback zone', hi: 'दायाँ सेटबैक क्षेत्र' },
  proposed: { en: 'proposed', hi: 'प्रस्तावित' },

  statusCardDisclaimer: {
    en: 'This is a preliminary rule check based on indexed records. Final approval remains with the competent authority.',
    hi: 'यह अनुक्रमित अभिलेखों पर आधारित एक प्रारंभिक नियम जाँच है। अंतिम स्वीकृति सक्षम प्राधिकारी के अधिकार में ही रहेगी।',
  },
  violationDetail: { en: 'short by', hi: 'की कमी' },
  violationDetailFloors: { en: 'exceeds permissible floors by', hi: 'अनुमेय तलों से अधिक' },
  officerReviewReason: { en: 'The dataset cannot resolve this case cleanly', hi: 'डेटासेट इस मामले का स्पष्ट समाधान नहीं कर पा रहा' },
  needsInputReason: { en: 'Provide the missing field to complete the rule lookup', hi: 'नियम खोज पूर्ण करने हेतु शेष जानकारी दें' },

  timelineTitle: { en: 'Amendment Time Machine', hi: 'संशोधन टाइम मशीन' },
  timelineConsolidated: { en: 'March 2025 — Consolidated MP Bhumi Vikas Rules', hi: 'मार्च 2025 — समेकित म.प्र. भूमि विकास नियम' },
  timelineAmendment: { en: '28 Aug 2026 — Amendment for plots up to 500 sq m', hi: '28 अग 2026 — 500 वर्ग मीटर तक के भूखंडों हेतु संशोधन' },
  timelineApplies: {
    en: 'The 28 Aug 2026 amendment applies to this plot and overrides the earlier March 2025 record.',
    hi: '28 अगस्त 2026 का संशोधन इस भूखंड पर लागू होता है और पूर्व मार्च 2025 के अभिलेख को अधिक्रमित करता है।',
  },
  timelineHistoricalNote: {
    en: 'Showing the rule in force on the selected date — this may differ from the position today.',
    hi: 'चयनित तिथि पर प्रभावी नियम दिखाया जा रहा है — यह आज की स्थिति से भिन्न हो सकता है।',
  },
  checkRulesOn: { en: 'Check rules applicable on', hi: 'किस तिथि पर नियम लागू करें' },
  selectedRule: { en: 'Selected source rule', hi: 'चयनित स्रोत नियम' },

  slipTitle: { en: 'Citizen Compliance Slip', hi: 'नागरिक अनुपालन पर्ची' },
  downloadSlip: { en: 'Download Compliance Slip', hi: 'अनुपालन पर्ची डाउनलोड करें' },
  closeSlip: { en: 'Close', hi: 'बंद करें' },
  printSlip: { en: 'Print / Save as PDF', hi: 'प्रिंट / पीडीएफ़ के रूप में सहेजें' },
  slipReference: { en: 'Reference code', hi: 'संदर्भ कोड' },
  slipReferenceNote: {
    en: 'For internal record-keeping only — not a scannable verification code.',
    hi: 'केवल आंतरिक अभिलेखन हेतु — यह स्कैन करने योग्य सत्यापन कोड नहीं है।',
  },
  slipDisclaimer: {
    en: 'Preliminary guidance only. This document is not a building permission or approval.',
    hi: 'केवल प्रारंभिक मार्गदर्शन। यह दस्तावेज़ भवन अनुज्ञा अथवा स्वीकृति नहीं है।',
  },
  slipPlotDetails: { en: 'Plot details', hi: 'भूखंड विवरण' },
  slipSetbackSummary: { en: 'Setback requirements', hi: 'सेटबैक आवश्यकताएँ' },
  slipBuildableSummary: { en: 'Buildable area summary', hi: 'निर्माण योग्य क्षेत्र सारांश' },
  slipFloorsFarFee: { en: 'Floors, FAR and fee summary', hi: 'तल, एफ.ए.आर. एवं शुल्क सारांश' },
  slipLanguage: { en: 'Language', hi: 'भाषा' },
  slipDate: { en: 'Date issued', hi: 'जारी करने की तिथि' },

  demoTitle: { en: 'Try a demo scenario', hi: 'डेमो परिदृश्य आज़माएँ' },
  demo1Title: { en: '200 sq m Residential, 9 m Road', hi: '200 वर्ग मी आवासीय, 9 मी सड़क' },
  demo1Desc: { en: 'Standard rule lookup with visible setback zones', hi: 'दृश्य सेटबैक क्षेत्रों सहित मानक नियम खोज' },
  demo2Title: { en: '450 sq m Plot — Aug 2026 Amendment', hi: '450 वर्ग मी भूखंड — अग 2026 संशोधन' },
  demo2Desc: { en: 'Shows the amendment overriding the March 2025 record', hi: 'संशोधन द्वारा मार्च 2025 अभिलेख के अधिक्रमण का प्रदर्शन' },
  demo3Title: { en: 'Potential Violation', hi: 'संभावित उल्लंघन' },
  demo3Desc: { en: 'Proposed front setback below the required value', hi: 'आवश्यक मान से कम प्रस्तावित फ्रंट सेटबैक' },
  demo4Title: { en: 'Missing Details', hi: 'अधूरी जानकारी' },
  demo4Desc: { en: 'Focused clarifying prompts instead of guessed values', hi: 'अनुमानित मान के बजाय केंद्रित स्पष्टीकरण अनुरोध' },

  north: { en: 'North', hi: 'उत्तर' },
  south: { en: 'South', hi: 'दक्षिण' },
  east: { en: 'East', hi: 'पूर्व' },
  west: { en: 'West', hi: 'पश्चिम' },
  facingNotProvided: { en: 'Direction not provided', hi: 'दिशा नहीं दी गई' },
} satisfies Record<string, Bi>

export type StringKey = keyof typeof S

export function t(key: StringKey, lang: Lang): string {
  return S[key][lang]
}

export function bi(value: Bi | undefined, lang: Lang): string {
  return value ? value[lang] : ''
}

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
