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
  versionVerified: { en: 'Notification verified against the official gazette', hi: 'अधिसूचना आधिकारिक राजपत्र से सत्यापित' },
  versionUnverified: { en: 'Notification not yet verified — confirm with the official gazette', hi: 'अधिसूचना अभी सत्यापित नहीं — आधिकारिक राजपत्र से पुष्टि करें' },
  calculated: { en: 'Calculated from the cited rule', hi: 'उद्धृत नियम से गणना' },
  changed: { en: 'Changed by amendment', hi: 'संशोधन द्वारा परिवर्तित' },
  unchanged: { en: 'Re-notified, value unchanged', hi: 'पुनः अधिसूचित, मान अपरिवर्तित' },
  sourceNeedsVerification: { en: 'Source needs verification', hi: 'स्रोत सत्यापन आवश्यक' },
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

  step1Title: { en: 'Step 1 — Essential plot details', hi: 'चरण 1 — आवश्यक भूखंड विवरण' },
  step2Title: { en: 'Step 2 (optional) — Plot shape & proposed construction', hi: 'चरण 2 (वैकल्पिक) — भूखंड आकार एवं प्रस्तावित निर्माण' },
  step2Help: {
    en: 'Add these for a to-scale drawing and a check against your actual plan. You can get a rule answer without them.',
    hi: 'सटीक मापदंड आरेख एवं अपने वास्तविक नक़्शे की जाँच हेतु ये जोड़ें। इनके बिना भी नियम उत्तर मिल सकता है।',
  },
  plotAreaHelp: {
    en: 'The total size of your plot in square metres — not the built-up or floor area.',
    hi: 'आपके भूखंड का कुल क्षेत्रफल वर्ग मीटर में — निर्मित अथवा तल क्षेत्र नहीं।',
  },
  roadWidthHelp: {
    en: "The width of the road your plot's main entrance faces.",
    hi: 'जिस सड़क की ओर आपके भूखंड का मुख्य प्रवेश द्वार है, उसकी चौड़ाई।',
  },
  useHelp: {
    en: 'What the building will mainly be used for — residential, commercial, or mixed.',
    hi: 'भवन का मुख्य उपयोग — आवासीय, वाणिज्यिक अथवा मिश्रित।',
  },
  proposedFloorsHelp: {
    en: 'How many floors you plan to build — optional, used only to check against the permissible limit.',
    hi: 'आप कितने तल बनाने की योजना रखते हैं — वैकल्पिक, केवल अनुमेय सीमा से जाँच हेतु।',
  },

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
  scopeNote: {
    en: 'This checks the setback, floor, FAR and fee figures above only. It does not confirm land-use zoning, development-plan conditions, ownership, or structural safety.',
    hi: 'यह केवल उपरोक्त सेटबैक, तल, एफ.ए.आर. एवं शुल्क आँकड़ों की जाँच करता है। यह भू-उपयोग क्षेत्रीकरण, विकास योजना शर्तों, स्वामित्व अथवा संरचनात्मक सुरक्षा की पुष्टि नहीं करता।',
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

  beforeYouApplyTitle: { en: 'Before you apply', hi: 'आवेदन से पहले' },
  beforeYouApplyZoning: {
    en: 'Confirm applicable land use and development-plan conditions for this plot with the Building Permission Branch — this check covers rule tables only, not zoning maps.',
    hi: 'इस भूखंड हेतु लागू भू-उपयोग एवं विकास योजना शर्तों की पुष्टि भवन अनुज्ञा शाखा से करें — यह जाँच केवल नियम तालिकाओं को कवर करती है, ज़ोनिंग मानचित्र को नहीं।',
  },
  beforeYouApplyZone: {
    en: 'You have not entered a zone/locality — confirm it yourself before relying on the use entered above.',
    hi: 'आपने क्षेत्र/मोहल्ला दर्ज नहीं किया — उपर्युक्त उपयोग पर निर्भर होने से पूर्व स्वयं पुष्टि करें।',
  },
  beforeYouApplyViolation: { en: 'Resolve this potential violation before applying', hi: 'आवेदन से पूर्व इस संभावित उल्लंघन का समाधान करें' },
  beforeYouApplyOfficerReview: {
    en: 'These need officer review because the dataset could not resolve them cleanly',
    hi: 'इन्हें अधिकारी समीक्षा की आवश्यकता है क्योंकि डेटासेट इनका स्पष्ट समाधान नहीं कर सका',
  },
  beforeYouApplyMissing: { en: 'Provide these to complete the preliminary check', hi: 'प्रारंभिक जाँच पूर्ण करने हेतु ये प्रदान करें' },
  beforeYouApplyCarry: {
    en: 'Carry the rule numbers, table numbers, and effective date shown above — or the printed Compliance Slip — when you visit the Building Permission Branch.',
    hi: 'भवन अनुज्ञा शाखा जाते समय उपरोक्त नियम क्रमांक, तालिका क्रमांक एवं प्रभावी तिथि — अथवा मुद्रित अनुपालन पर्ची — साथ ले जाएँ।',
  },
  beforeYouApplyNotApproval: {
    en: 'This is preliminary guidance only — not a building permission or approval.',
    hi: 'यह केवल प्रारंभिक मार्गदर्शन है — भवन अनुज्ञा अथवा स्वीकृति नहीं।',
  },

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

  // ---- Landing: navigation & hero -----------------------------------------
  navHowItWorks: { en: 'How It Works', hi: 'यह कैसे काम करता है' },
  navFeatures: { en: 'Features', hi: 'विशेषताएँ' },
  navRuleUpdates: { en: 'Rule Updates', hi: 'नियम अद्यतन' },
  ctaCheckPlot: { en: 'Check Your Plot', hi: 'अपना भूखंड जाँचें' },
  ctaSeeHow: { en: 'See How It Works', hi: 'कार्यप्रणाली देखें' },
  ctaStartCheck: { en: 'Start Plot Check', hi: 'भूखंड जाँच शुरू करें' },
  backToHome: { en: 'Back to home', hi: 'मुखपृष्ठ पर लौटें' },
  heroBadge: {
    en: 'Bilingual • Citation-first • Amendment-aware',
    hi: 'द्विभाषी • उद्धरण-आधारित • संशोधन-सचेत',
  },
  heroHeadline: { en: 'Build with clarity, before you submit.', hi: 'प्रस्तुत करने से पहले, स्पष्टता के साथ बनाएँ।' },
  heroSub: {
    en: 'NiyamSathi turns complex Bhopal building rules into fast, visual, source-backed guidance for setbacks, floors, FAR, fees, and amendments.',
    hi: 'नियमसाथी भोपाल के जटिल भवन नियमों को सेटबैक, तल, एफ.ए.आर., शुल्क एवं संशोधनों हेतु त्वरित, दृश्य और स्रोत-आधारित मार्गदर्शन में बदलता है।',
  },
  heroFactPlot: { en: '200 sq m Residential Plot', hi: '200 वर्ग मी आवासीय भूखंड' },
  heroFactRoad: { en: '9 m Road', hi: '9 मी सड़क' },
  heroFactRule: { en: 'Rule 25 · Table 8', hi: 'नियम 25 · तालिका 8' },

  // ---- Landing: problem to solution ---------------------------------------
  problemTitle: { en: 'From a long rulebook to one clear answer', hi: 'लंबी नियम पुस्तिका से एक स्पष्ट उत्तर तक' },
  problemSub: {
    en: 'The rules have always been public. Finding the one row that applies to your plot is the hard part.',
    hi: 'नियम सदैव सार्वजनिक रहे हैं। कठिन कार्य है आपके भूखंड पर लागू होने वाली एकमात्र प्रविष्टि ढूँढ़ना।',
  },
  beforeTitle: { en: 'Today', hi: 'वर्तमान स्थिति' },
  afterTitle: { en: 'With NiyamSathi', hi: 'नियमसाथी के साथ' },
  before1: { en: 'A long rulebook to read end to end', hi: 'आद्योपांत पढ़ने हेतु लंबी नियम पुस्तिका' },
  before2: { en: 'Tables spread across dozens of pages', hi: 'दर्जनों पृष्ठों में बिखरी तालिकाएँ' },
  before3: { en: 'Amendments easily missed', hi: 'संशोधन सहज ही छूट जाते हैं' },
  before4: { en: 'Hindi documents difficult to search', hi: 'हिन्दी दस्तावेज़ों में खोज कठिन' },
  before5: { en: 'Citizens discover violations late', hi: 'नागरिकों को उल्लंघन देर से ज्ञात होता है' },
  after1: { en: 'Ask in Hindi or English', hi: 'हिन्दी अथवा अंग्रेज़ी में पूछें' },
  after2: { en: 'Get a visual plot check', hi: 'दृश्य भूखंड जाँच प्राप्त करें' },
  after3: { en: 'View the latest applicable amendment', hi: 'नवीनतम लागू संशोधन देखें' },
  after4: { en: 'See exact rule citations', hi: 'सटीक नियम उद्धरण देखें' },
  after5: { en: 'Download a citizen guidance slip', hi: 'नागरिक मार्गदर्शन पर्ची डाउनलोड करें' },

  // ---- Landing: features --------------------------------------------------
  featuresTitle: { en: 'Built for proof, not guesswork', hi: 'अनुमान नहीं, प्रमाण हेतु निर्मित' },
  featuresSub: {
    en: 'Every number on screen can be traced back to a rule, a table, and a page.',
    hi: 'स्क्रीन पर दिखने वाले प्रत्येक अंक को एक नियम, एक तालिका और एक पृष्ठ तक खोजा जा सकता है।',
  },
  feat1Title: { en: 'Visual Plot Compliance', hi: 'दृश्य भूखंड अनुपालन' },
  feat1Desc: {
    en: 'See buildable and mandatory open spaces directly on the plot.',
    hi: 'निर्माण योग्य एवं अनिवार्य खुले क्षेत्र सीधे भूखंड पर देखें।',
  },
  feat2Title: { en: 'Voice in Hindi and English', hi: 'हिन्दी एवं अंग्रेज़ी में वाणी' },
  feat2Desc: {
    en: 'Ask naturally and hear the answer in the same language.',
    hi: 'सहज रूप से पूछें और उसी भाषा में उत्तर सुनें।',
  },
  feat3Title: { en: 'Latest Rule Version', hi: 'नवीनतम नियम संस्करण' },
  feat3Desc: {
    en: 'Know whether the March 2025 rules or the August 2026 amendment applies.',
    hi: 'जानें कि मार्च 2025 के नियम लागू हैं अथवा अगस्त 2026 का संशोधन।',
  },
  feat4Title: { en: 'Proof Behind Every Answer', hi: 'प्रत्येक उत्तर के पीछे प्रमाण' },
  feat4Desc: {
    en: 'Every answer includes rule number, table, page, and exact source text.',
    hi: 'प्रत्येक उत्तर में नियम संख्या, तालिका, पृष्ठ एवं यथावत् स्रोत पाठ सम्मिलित है।',
  },

  // ---- Landing: how it works ----------------------------------------------
  howTitle: { en: 'Three steps to a cited answer', hi: 'उद्धृत उत्तर तक तीन चरण' },
  how1Title: { en: 'Enter or speak plot details', hi: 'भूखंड विवरण दर्ज करें या बोलें' },
  how1Desc: {
    en: 'Plot area, road width, use — in Hindi or English, typed or spoken.',
    hi: 'भूखंड क्षेत्रफल, सड़क की चौड़ाई, उपयोग — हिन्दी या अंग्रेज़ी में, लिखकर या बोलकर।',
  },
  how2Title: { en: 'NiyamSathi matches the latest applicable rule', hi: 'नियमसाथी नवीनतम लागू नियम से मिलान करता है' },
  how2Desc: {
    en: 'Conditions are checked row by row, and the version in force on your date wins.',
    hi: 'शर्तें प्रविष्टि-दर-प्रविष्टि जाँची जाती हैं, और आपकी तिथि पर प्रभावी संस्करण मान्य होता है।',
  },
  how3Title: { en: 'Get a visual, cited compliance check', hi: 'दृश्य, उद्धृत अनुपालन जाँच प्राप्त करें' },
  how3Desc: {
    en: 'A plot diagram, a status, and the rule number behind every figure.',
    hi: 'एक भूखंड आरेख, एक स्थिति, और प्रत्येक आँकड़े के पीछे का नियम क्रमांक।',
  },
  finalCtaHeadline: { en: 'Know the rule before you draw the plan.', hi: 'नक्शा बनाने से पहले नियम जानें।' },
  finalCtaSub: {
    en: 'A preliminary check takes under a minute and cites every figure it shows.',
    hi: 'प्रारंभिक जाँच में एक मिनट से भी कम समय लगता है और यह प्रत्येक आँकड़े का स्रोत बताती है।',
  },
  landingDisclaimer: {
    en: 'Preliminary guidance only. Final building approval remains with the competent authority.',
    hi: 'केवल प्रारंभिक मार्गदर्शन। अंतिम भवन स्वीकृति सक्षम प्राधिकारी के अधिकार में ही रहेगी।',
  },

  // ---- Dashboard shell ----------------------------------------------------
  dashboardTitle: { en: 'Plot Compliance Check', hi: 'भूखंड अनुपालन जाँच' },
  panelPlotDetails: { en: 'Plot Details', hi: 'भूखंड विवरण' },
  panelResults: { en: 'Rule Results', hi: 'नियम परिणाम' },
  quickInputs: { en: 'Quick inputs', hi: 'त्वरित प्रविष्टियाँ' },
  checkCompliance: { en: 'Check Compliance', hi: 'अनुपालन जाँचें' },
  awaitingInput: { en: 'Awaiting plot details', hi: 'भूखंड विवरण की प्रतीक्षा' },
  awaitingInputHelp: {
    en: 'Enter a question or fill the quick inputs, then run a compliance check to see the plot map and cited results.',
    hi: 'प्रश्न लिखें अथवा त्वरित प्रविष्टियाँ भरें, फिर भूखंड मानचित्र एवं उद्धृत परिणाम देखने हेतु अनुपालन जाँच चलाएँ।',
  },
  ruleVersionInForce: { en: 'Rule version', hi: 'नियम संस्करण' },

  // ---- Voice --------------------------------------------------------------
  askByVoice: { en: 'Ask by Voice', hi: 'बोलकर पूछें' },
  listening: { en: 'Listening…', hi: 'सुन रहे हैं…' },
  stopListening: { en: 'Stop listening', hi: 'सुनना रोकें' },
  voiceHeard: { en: 'Heard', hi: 'सुना गया' },
  voiceUnsupported: {
    en: 'Voice input is not available in this browser. Typing works exactly the same.',
    hi: 'इस ब्राउज़र में वाणी इनपुट उपलब्ध नहीं है। टाइप करने पर भी वही परिणाम मिलेगा।',
  },
  voiceError: { en: 'Could not hear that — please try again or type the question.', hi: 'सुनाई नहीं दिया — कृपया पुनः प्रयास करें अथवा प्रश्न लिखें।' },
  speakAnswer: { en: 'Read answer aloud', hi: 'उत्तर सुनाएँ' },
  stopSpeaking: { en: 'Stop reading', hi: 'सुनाना रोकें' },
  speaking: { en: 'Reading answer…', hi: 'उत्तर सुनाया जा रहा है…' },

  // ---- Map controls -------------------------------------------------------
  mapResetView: { en: 'Reset view', hi: 'दृश्य रीसेट करें' },
  mapToggleDimensions: { en: 'Toggle dimensions', hi: 'आयाम दिखाएँ या छिपाएँ' },
  mapToggleCitations: { en: 'Toggle citations', hi: 'उद्धरण दिखाएँ या छिपाएँ' },
  mapFullscreen: { en: 'Expand map', hi: 'मानचित्र बड़ा करें' },
  mapExitFullscreen: { en: 'Close expanded map', hi: 'बड़ा मानचित्र बंद करें' },
  mapPlanView: { en: 'Plan view', hi: 'समतल दृश्य' },
  mapIsoView: { en: '3D view', hi: '3डी दृश्य' },
  mapViewMode: { en: 'View mode', hi: 'दृश्य प्रकार' },

  // ---- Why this rule ------------------------------------------------------
  whyThisRule: { en: 'Why this rule?', hi: 'यह नियम क्यों?' },
  whyDetected: { en: 'Plot conditions detected', hi: 'पहचानी गई भूखंड शर्तें' },
  whyMatched: { en: 'Matching rule conditions', hi: 'मेल खाती नियम शर्तें' },
  whyVersion: { en: 'Version selected', hi: 'चयनित संस्करण' },
  whySupersede: { en: 'Why the newer record wins', hi: 'नवीन अभिलेख क्यों मान्य है' },
  whySupersedeText: {
    en: 'Both records match this plot, so the one in force on the selected date governs. The earlier value is kept on screen rather than hidden.',
    hi: 'दोनों अभिलेख इस भूखंड पर लागू होते हैं, अतः चयनित तिथि पर प्रभावी अभिलेख मान्य है। पूर्व मान छिपाया नहीं गया, स्क्रीन पर रखा गया है।',
  },
  whyOnlyRecord: {
    en: 'Only one record in the dataset matches these conditions on the selected date.',
    hi: 'चयनित तिथि पर डेटासेट में केवल एक अभिलेख इन शर्तों से मेल खाता है।',
  },

  // ---- Misc ---------------------------------------------------------------
  demoDataBadge: { en: 'Demo dataset — verify against official record', hi: 'डेमो डेटासेट — आधिकारिक अभिलेख से सत्यापित करें' },
  verificationStatus: { en: 'Status', hi: 'स्थिति' },
  trustDisclaimer: {
    en: 'This tool provides preliminary rule references. Final building approval remains with the competent authority.',
    hi: 'यह साधन प्रारंभिक नियम संदर्भ प्रदान करता है। अंतिम भवन स्वीकृति सक्षम प्राधिकारी के अधिकार में ही रहेगी।',
  },
  langToggle: { en: 'Language', hi: 'भाषा' },
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
