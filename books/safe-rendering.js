// Database and Open Library values must never be parsed as HTML.
const FALLBACK_COVER = "https://via.placeholder.com/120x180";

export function textElement(tag, value, className = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = String(value ?? "");
  return node;
}

export function safeCoverUrl(value) {
  if (typeof value !== "string") return FALLBACK_COVER;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch {
    // Malformed or relative URLs use the existing placeholder.
  }
  return FALLBACK_COVER;
}

function coverImage(value) {
  const image = document.createElement("img");
  image.className = "book-cover";
  image.src = safeCoverUrl(value);
  return image;
}

function actionButton(label, className, disabled = false) {
  const button = textElement("button", label, className);
  button.disabled = Boolean(disabled);
  return button;
}

export function createMemberCard(member) {
  const card = textElement("div", "", "member-card");
  const info = textElement("div", "", "book-info");
  info.append(textElement("h3", member.name || member.email), textElement("p", member.email));
  card.append(info, actionButton("Approve", "btn approve"), actionButton("Deny", "btn deny"));
  return card;
}

export function createPeriodCard(period) {
  const card = textElement("div", "", "period-card");
  const heading = `${period.name || "Unnamed Period"} ${period.active ? "(Open)" : "(Closed)"} ${period.votingActive ? "(Voting Active)" : ""}`;
  card.append(
    textElement("h3", heading),
    actionButton("See Submissions", "btn seeSubmissions"),
    actionButton("Edit Name", "btn editPeriod"),
    actionButton("Delete Period", "btn deletePeriod")
  );
  return card;
}

export function createBookCard(book, { showVotes = false, buttons = [], groupedActions = false } = {}) {
  const card = textElement("div", "", "submission-card");
  const info = textElement("div", "", "book-info");
  info.append(textElement("h3", book.title), textElement("p", book.author));
  if (showVotes) info.append(textElement("p", `Votes: ${book.votes?.length || 0}`));
  if (buttons.length) {
    const actions = groupedActions ? textElement("div", "", "book-actions") : info;
    for (const button of buttons) actions.append(actionButton(button.label, button.className, button.disabled));
    if (groupedActions) info.append(actions);
  }
  card.append(coverImage(book.coverUrl), info);
  return card;
}

function detailLine(label, value) {
  const line = document.createElement("p");
  line.append(textElement("strong", label), document.createTextNode(` ${value ?? ""}`));
  return line;
}

export function createWinnerCard(winner, details) {
  const card = textElement("div", "", "submission-card");
  card.style.flexDirection = "column";
  card.style.alignItems = "center";
  const image = coverImage(winner.coverUrl);
  image.style.width = "150px";
  image.style.height = "220px";
  const info = textElement("div", "", "book-info");
  info.style.textAlign = "center";
  info.style.marginTop = "0.5rem";
  const description = detailLine("Description:", details.description);
  description.style.fontSize = "0.9rem";
  const votes = detailLine("Votes:", winner.votes?.length || 0);
  votes.style.marginTop = "0.5rem";
  info.append(
    textElement("h3", winner.title),
    detailLine("Author:", winner.author),
    detailLine("Year Published:", details.year),
    detailLine("Pages:", details.pages),
    description,
    votes
  );
  card.append(image, info);
  return card;
}
