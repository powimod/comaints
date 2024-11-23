import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: { 
            globals: {
                ...globals.browser, 
                ...globals.node
            } 
        },
        rules: {
            semi: ["error", "always"]
        }
    },
    pluginJs.configs.recommended,
];
