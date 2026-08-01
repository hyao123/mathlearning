const CHALLENGE_FIELDS = [
  "id",
  "title",
  "prompt",
  "difficulty",
  "slot",
  "isBoss",
  "learningObjective",
  "storyBeat"
];

function toChallengeQuestion(question, options = {}) {
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    throw new Error("A question object is required");
  }

  const challengeQuestion = {};
  for (const field of CHALLENGE_FIELDS) {
    if (Object.hasOwn(question, field)) challengeQuestion[field] = question[field];
  }
  if (Array.isArray(options.rewardPreview)) {
    challengeQuestion.rewardPreview = [...options.rewardPreview];
  }
  return challengeQuestion;
}

function judgeAnswer(question, userAnswer, answerMatcher) {
  if (!question || typeof question !== "object") throw new Error("A question object is required");
  if (!answerMatcher || typeof answerMatcher.isAnswerCorrect !== "function") {
    throw new Error("Answer matcher is required");
  }

  return {
    correct: Boolean(answerMatcher.isAnswerCorrect(userAnswer, question.answer, {
      acceptedAnswers: question.acceptedAnswers
    }))
  };
}

function buildSolutionReview(question) {
  const review = question?.solutionReview;
  if (!review || typeof review !== "object" || Array.isArray(review)) return null;

  return {
    observation: review.observation,
    steps: Array.isArray(review.steps) ? [...review.steps] : [],
    answer: review.answer,
    check: review.check,
    pitfall: review.pitfall
  };
}

module.exports = {
  CHALLENGE_FIELDS,
  toChallengeQuestion,
  judgeAnswer,
  buildSolutionReview
};
