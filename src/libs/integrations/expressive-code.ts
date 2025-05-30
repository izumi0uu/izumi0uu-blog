import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

const expressiveCodeIntegration = () =>
  expressiveCode({
    themes: ["light-plus", "dark-plus"],
    useDarkModeMediaQuery: true,
    themeCssRoot: ":root",
    themeCssSelector: (theme) => {
      let themeSelector: string;
      switch (theme.type) {
        case "light":
          themeSelector = "[class='']";
          break;
        case "dark":
          themeSelector = "[class='dark']";
          break;
        default:
          themeSelector = "[class='']";
          break;
      }
      return themeSelector;
    },
    tabWidth: 2,
    styleOverrides: {
      codeFontSize: "",
      codeLineHeight: "1.4",
      frames: {
        frameBoxShadowCssValue: "none",
      },
    },
    plugins: [pluginCollapsibleSections()],
  });

export { expressiveCodeIntegration };
