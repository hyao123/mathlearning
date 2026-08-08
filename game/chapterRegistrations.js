const { nativeChapterModules } = require("./nativeQuestionPacks.js");
const { supplementalQuestionsByModule: chapter01SupplementalQuestions } = require("./chapterQuestionPacks.js");
const { supplementalQuestionsByModule: chapter02SupplementalQuestions } = require("./chapter02QuestionPacks.js");
const { supplementalQuestionsByModule: chapter03SupplementalQuestions } = require("./chapter03QuestionPacks.js");
const { supplementalQuestionsByModule: chapter04SupplementalQuestions, chapterModules: chapter04Modules } = require("./chapter04QuestionPacks.js");
const { supplementalQuestionsByModule: chapter05SupplementalQuestions, chapterModules: chapter05Modules } = require("./chapter05QuestionPacks.js");
const { supplementalQuestionsByModule: chapter06SupplementalQuestions, chapterModules: chapter06Modules } = require("./chapter06QuestionPacks.js");
const { supplementalQuestionsByModule: chapter07SupplementalQuestions, chapterModules: chapter07Modules } = require("./chapter07QuestionPacks.js");
const { supplementalQuestionsByModule: chapter08SupplementalQuestions, chapterModules: chapter08Modules } = require("./chapter08QuestionPacks.js");
const { supplementalQuestionsByModule: chapter09SupplementalQuestions, chapterModules: chapter09Modules } = require("./chapter09QuestionPacks.js");

function freezeRegistration({ chapterId, nativeModules, supplementalQuestionsByModule, supplementalCount, moduleSource }) {
  return Object.freeze({
    chapterId,
    nativeModules: Object.freeze(nativeModules || []),
    supplementalQuestionsByModule: Object.freeze(supplementalQuestionsByModule || {}),
    supplementalCount: Number.isInteger(supplementalCount) ? supplementalCount : 0,
    moduleSource: moduleSource === "legacy" ? "legacy" : "native"
  });
}

const CHAPTER_REGISTRATIONS = Object.freeze([
  freezeRegistration({ chapterId: "chapter-01", nativeModules: nativeChapterModules["chapter-01"], supplementalQuestionsByModule: chapter01SupplementalQuestions, supplementalCount: 4, moduleSource: "legacy" }),
  freezeRegistration({ chapterId: "chapter-02", nativeModules: nativeChapterModules["chapter-02"], supplementalQuestionsByModule: chapter02SupplementalQuestions, supplementalCount: 4, moduleSource: "legacy" }),
  freezeRegistration({ chapterId: "chapter-03", nativeModules: nativeChapterModules["chapter-03"], supplementalQuestionsByModule: chapter03SupplementalQuestions, supplementalCount: 1, moduleSource: "legacy" }),
  freezeRegistration({ chapterId: "chapter-04", nativeModules: chapter04Modules, supplementalQuestionsByModule: chapter04SupplementalQuestions, supplementalCount: 10 }),
  freezeRegistration({ chapterId: "chapter-05", nativeModules: chapter05Modules, supplementalQuestionsByModule: chapter05SupplementalQuestions, supplementalCount: 10 }),
  freezeRegistration({ chapterId: "chapter-06", nativeModules: chapter06Modules, supplementalQuestionsByModule: chapter06SupplementalQuestions, supplementalCount: 10 }),
  freezeRegistration({ chapterId: "chapter-07", nativeModules: chapter07Modules, supplementalQuestionsByModule: chapter07SupplementalQuestions, supplementalCount: 0 }),
  freezeRegistration({ chapterId: "chapter-08", nativeModules: chapter08Modules, supplementalQuestionsByModule: chapter08SupplementalQuestions, supplementalCount: 0 }),
  freezeRegistration({ chapterId: "chapter-09", nativeModules: chapter09Modules, supplementalQuestionsByModule: chapter09SupplementalQuestions, supplementalCount: 0 })
]);

const CHAPTER_REGISTRATION_BY_ID = Object.freeze(Object.fromEntries(
  CHAPTER_REGISTRATIONS.map((registration) => [registration.chapterId, registration])
));

function getChapterRegistration(chapterId) {
  const registration = CHAPTER_REGISTRATION_BY_ID[chapterId];
  if (!registration) throw new Error(`Missing chapter registration: ${chapterId}`);
  return registration;
}

module.exports = { CHAPTER_REGISTRATIONS, CHAPTER_REGISTRATION_BY_ID, getChapterRegistration };
