"""Renders a unit file as a readable Markdown list of tasks with solutions – for the parent to review."""

from .validate import item_label

LEVEL_NAMES = {
    1: "Level 1 – The Castle Garden (Letters a, b, c, d)",
    2: "Level 2 – The Library (Little words)",
    3: "Level 3 – The Potion Cellar (Colours, toys & family)",
    4: "Level 4 – The Astronomy Tower (Sentences, last 2 tasks: the Sphinx)",
}

TYPE_NAMES = {
    "pick": "posłuchaj i stuknij",
    "gap_fill": "uzupełnij lukę",
    "word_order": "ułóż zdanie",
    "match_pairs": "dopasuj pary",
}


def _item_md(item) -> str:
    if isinstance(item, str):
        return item
    shown = " ".join(filter(None, [item.get("pic"), item.get("color"), item.get("draw"), item.get("text")]))
    return f"{shown} („{item['say']}”)" if item.get("say") and item.get("say") != item.get("text") else shown


def _task_md(t: dict) -> list[str]:
    out = [f"### {t['id']} · {TYPE_NAMES.get(t['type'], t['type'])}", "", f"**{t['instruction']}**", ""]
    if t.get("say"):
        out += [f"🔊 „{t['say']}”", ""]
    if t.get("show"):
        out += [f"Obrazek: {_item_md(t['show'])}", ""]
    kind = t["type"]
    if kind == "pick":
        out += [f"- {'**✓ ' + _item_md(o) + '**' if i == t['answer'] else _item_md(o)}" for i, o in enumerate(t["options"])]
    elif kind == "gap_fill":
        filled = t["text"]
        for answers in t["answers"]:
            filled = filled.replace("___", f"**[{' / '.join(answers)}]**", 1)
        out.append(filled)
        out.append(f"\nBank słów: {', '.join(t['bank'])}")
    elif kind == "word_order":
        out.append(f"Rozwiązanie: **{' '.join(t['words'])}**")
        for a in t.get("accepted", []):
            out.append(f"- też akceptowane: {a}")
    elif kind == "match_pairs":
        out += [f"- {_item_md(left)} → **{item_label(right)}** {_item_md(right) if not isinstance(right, str) else ''}".rstrip() for left, right in t["pairs"]]
    if t.get("hint"):
        out.append(f"\nPodpowiedź: {t['hint']}")
    if t.get("explanation"):
        out.append(f"Wyjaśnienie: {t['explanation']}")
    return out + [""]


def render_review(data: dict) -> str:
    lines = [f"# Unit {data.get('unit', '?')} – {data.get('title', '')}", "", "Zadania do przejrzenia przed udostępnieniem gry. 🔊 = to, co mówi głos.", ""]
    for level, name in LEVEL_NAMES.items():
        tasks = [t for t in data["tasks"] if t.get("level") == level]
        lines += [f"## {name} ({len(tasks)} zadań)", ""]
        for t in tasks:
            lines += _task_md(t)
    return "\n".join(lines)
