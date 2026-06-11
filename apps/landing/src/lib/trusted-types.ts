/** Permite React e scripts dinâmicos quando CSP exige Trusted Types. */
const tt = globalThis.trustedTypes;
if (tt?.createPolicy) {
  tt.createPolicy("default", {
    createHTML: (html) => html,
    createScriptURL: (url) => url,
    createScript: (script) => script,
  });
}
