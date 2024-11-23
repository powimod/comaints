import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: { 
            globals: {
                ...globals.browser, 
                ...globals.node,
                ...globals.mocha
            } 
        },
        ...pluginJs.configs.recommended,
        rules: {
            "semi": ["error", "always"],
            "no-unused-vars": ["warn", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
        }
    },
];
