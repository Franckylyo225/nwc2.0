const formatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Date d'article en français, ou chaîne vide si l'article n'en a pas. */
export function formatArticleDate(date: Date | null) {
  return date ? formatter.format(date) : "";
}
