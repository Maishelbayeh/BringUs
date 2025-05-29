import { createTheme, ThemeProvider, Theme } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

export const changeLang = (i18n: any): void => {
    i18n.language === 'en'? i18n.changeLanguage('ar') : i18n.changeLanguage('en')
} 

export const theme = () =>
  createTheme({
    direction: "ltr",
});

export const cacheRtl = createCache({
  key: "muiltr",
  stylisPlugins: [prefixer, rtlPlugin],
});
  