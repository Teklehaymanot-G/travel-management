import i18n from "../localization/i18n";

export const isRTL = i18n.language === "am";

export const rtlStyle = (styles) => {
  if (!isRTL) return styles;

  const flippedStyles = {};

  Object.keys(styles).forEach((key) => {
    const style = styles[key];

    // Handle horizontal margins and paddings
    if (style.marginHorizontal) {
      style.marginRight = style.marginLeft;
      style.marginLeft = style.marginRight;
    }

    if (style.paddingHorizontal) {
      style.paddingRight = style.paddingLeft;
      style.paddingLeft = style.paddingRight;
    }

    // Handle text alignment
    if (style.textAlign) {
      style.textAlign =
        style.textAlign === "left"
          ? "right"
          : style.textAlign === "right"
          ? "left"
          : style.textAlign;
    }

    // Handle flex direction
    if (style.flexDirection) {
      style.flexDirection =
        style.flexDirection === "row"
          ? "row-reverse"
          : style.flexDirection === "row-reverse"
          ? "row"
          : style.flexDirection;
    }

    flippedStyles[key] = style;
  });

  return flippedStyles;
};

export const rtlText = (text) => {
  return isRTL ? text.split("").reverse().join("") : text;
};
