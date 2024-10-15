/* eslint-disable func-names,no-unused-expressions,no-param-reassign,no-sequences */

// This function contains the script provided by SuveryMonkey,
// which is used to embed the survey in the html upon this function
// being called after a learner closes the chat window for the control group.
const showSurvey = () => {
  (function (t, e, s, o) { let n; let c; let l; t.SMCX = t.SMCX || [], e.getElementById(o) || (n = e.getElementsByTagName(s), c = n[n.length - 1], l = e.createElement(s), l.type = 'text/javascript', l.async = !0, l.id = o, l.src = 'https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd30kMLlLtc4okiu60NJiBPZxbfwe_2FCDOk5JO3Imfyeqk.js', c.parentNode.insertBefore(l, c)); }(window, document, 'script', 'smcx-sdk'));
};

export default showSurvey;
