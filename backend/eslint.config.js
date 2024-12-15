import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {   
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            }
        },
        ...pluginJs.configs.recommended,
        rules: {
            "semi": ["error", "always"], // Toujours un point-virgule
            "no-console": "off", // Permet l'utilisation de `console.log` (utile en backend)
            "strict": ["error", "global"], // Force le mode strict au niveau global
            "no-unused-vars": ["error", { "args": "none" }],
        },
    }
];

