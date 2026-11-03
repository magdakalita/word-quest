"""Checks that a unit file (web/data/unitNN.json) is complete and every task is solvable."""

from collections import Counter

LEVELS = (1, 2, 3, 4)
TYPES = {"pick", "gap_fill", "word_order", "match_pairs"}
DRAWINGS = {"blob", "box", "ball", "cupcake"}  # see web/js/pics.js
COLOURS = {"red", "blue", "green", "yellow", "pink", "orange", "purple", "brown", "black", "white"}
ITEM_KEYS = {"text", "pic", "say", "draw", "color"}


def _is_str_list(value, min_len=1):
    return isinstance(value, list) and len(value) >= min_len and all(isinstance(v, str) and v.strip() for v in value)


def item_label(item) -> str:
    """Mirrors itemLabel() in web/js/tasks/util.js."""
    if isinstance(item, str):
        return item
    return item.get("text") or item.get("say") or item.get("pic") or " ".join(filter(None, [item.get("color"), item.get("draw")]))


def _item_errors(item) -> list[str]:
    if isinstance(item, str):
        return [] if item.strip() else ["empty item"]
    if not isinstance(item, dict):
        return [f"item must be a string or an object: {item!r}"]
    errors = []
    if unknown := set(item) - ITEM_KEYS:
        errors.append(f"unknown item keys {sorted(unknown)}")
    if not any(item.get(k) for k in ("text", "pic", "draw", "color")):
        errors.append(f"item shows nothing: {item!r}")
    if item.get("draw") and item["draw"] not in DRAWINGS:
        errors.append(f"unknown drawing {item['draw']!r}")
    if item.get("color") and item["color"] not in COLOURS:
        errors.append(f"unknown colour {item['color']!r}")
    if (item.get("pic") or item.get("draw") or item.get("color")) and not item.get("text") and not item.get("say"):
        errors.append(f"picture needs a say: {item!r}")
    return errors


def validate_task(t: dict) -> list[str]:
    tid = t.get("id", "?")
    errors = []

    def err(msg):
        errors.append(f"{tid}: {msg}")

    if t.get("level") not in LEVELS:
        err(f"level must be one of {LEVELS}")
    kind = t.get("type")
    if kind not in TYPES:
        err(f"unknown type {kind!r}")
        return errors
    if not isinstance(t.get("instruction"), str) or not t["instruction"].strip():
        err("missing instruction")
    if "show" in t:
        for e in _item_errors(t["show"]):
            if not e.startswith("picture needs a say"):  # the instruction names what is shown
                err(f"show: {e}")

    if kind == "pick":
        options = t.get("options")
        if not isinstance(options, list) or len(options) < 2:
            err("options must list at least 2 items")
        else:
            for o in options:
                for e in _item_errors(o):
                    err(f"option: {e}")
            if not isinstance(t.get("answer"), int) or not 0 <= t["answer"] < len(options):
                err("answer must be the index of the correct option")
            labels = [item_label(o) for o in options]
            if len(set(labels)) != len(labels):
                err("options must be unique")
        if not t.get("say") and not t.get("show") and "?" not in t.get("instruction", ""):
            err("nothing tells the child what to look for – add say or show")
    elif kind == "gap_fill":
        text = t.get("text", "")
        gaps = text.count("___")
        answers = t.get("answers")
        if gaps == 0:
            err("text has no ___ gap")
        if not isinstance(answers, list) or len(answers) != gaps or not all(_is_str_list(a) for a in answers):
            err(f"answers must be a list of {gaps} non-empty lists of strings")
        elif not _is_str_list(t.get("bank"), 2):
            err("bank must list at least 2 words (the child cannot type)")
        else:
            missing = [a[0] for a in answers if a[0] not in t["bank"]]
            if missing:
                err(f"bank is missing the answers {missing}")
    elif kind == "word_order":
        if not _is_str_list(t.get("words"), 3):
            err("words must list at least 3 words")
        elif "accepted" in t:
            if not _is_str_list(t["accepted"]):
                err("accepted must be a list of strings")
            else:
                chips = Counter(w.lower().strip(".,!?") for w in t["words"])
                for a in t["accepted"]:
                    if Counter(w.lower().strip(".,!?") for w in a.split()) != chips:
                        err(f"accepted variant does not use exactly the given words: {a!r}")
    elif kind == "match_pairs":
        pairs = t.get("pairs")
        if not isinstance(pairs, list) or len(pairs) < 3 or not all(isinstance(p, list) and len(p) == 2 for p in pairs):
            err("pairs must be a list of at least 3 [left, right] pairs")
        else:
            for side, name in ((0, "left"), (1, "right")):
                for p in pairs:
                    for e in _item_errors(p[side]):
                        err(f"{name}: {e}")
                values = [item_label(p[side]) for p in pairs]
                if len(set(values)) != len(values):
                    err(f"{name} items must be unique")

    if not t.get("hint"):
        err("missing hint")
    return errors


def validate_unit(data: dict) -> list[str]:
    errors = []
    tasks = data.get("tasks")
    if not isinstance(tasks, list) or not tasks:
        return ["file has no tasks"]
    ids = [t.get("id") for t in tasks]
    dupes = [i for i, n in Counter(ids).items() if n > 1]
    if dupes:
        errors.append(f"duplicate task ids: {dupes}")
    for t in tasks:
        errors.extend(validate_task(t))
    for level in LEVELS:
        n = sum(1 for t in tasks if t.get("level") == level)
        if not 6 <= n <= 14:
            errors.append(f"level {level} has {n} tasks (expected 6–14)")
    return errors
