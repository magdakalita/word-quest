"""Checks that a unit file (web/data/unitNN.json) is complete and every task is solvable."""

import re
from collections import Counter
from pathlib import Path

LEVELS = (1, 2, 3, 4)
TYPES = {"pick", "gap_fill", "word_order", "match_pairs"}
DRAWINGS = {"blob", "box", "ball", "cupcake"}  # see web/js/pics.js
COLOURS = {"red", "blue", "navy", "green", "yellow", "pink", "orange", "purple", "brown", "grey", "black", "white"}
ITEM_KEYS = {"text", "pic", "say", "draw", "color", "sound"}
AUDIO = Path(__file__).resolve().parents[2] / "web" / "audio"
SPOKEN = ("instruction", "say", "hint", "explanation")
SOUND = re.compile(r"\[([a-z])\]")  # "[a]" = the letter sound, played from web/audio/a.m4a
# A lone letter would be read by its name ("bee") – only the words "a" and "I" are fine.
LONE_LETTER = re.compile(r"(?<![\w'\[])([B-HJ-Zb-z])(?![\w'\]])")


def _is_str_list(value, min_len=1):
    return isinstance(value, list) and len(value) >= min_len and all(isinstance(v, str) and v.strip() for v in value)


def _as_list(value) -> list:
    return value if isinstance(value, list) else []


def _is_index(value, items) -> bool:
    """An index into items – not a bool (True is an int in Python, but never === an index in JS)."""
    return type(value) is int and isinstance(items, list) and 0 <= value < len(items)


def item_label(item) -> str:
    """Mirrors itemLabel() in web/js/tasks/util.js."""
    if isinstance(item, str):
        return item
    return item.get("text") or item.get("sound") or item.get("say") or item.get("pic") or " ".join(filter(None, [item.get("color"), item.get("draw")]))


def _item_errors(item) -> list[str]:
    if isinstance(item, str):
        return [] if item.strip() else ["empty item"]
    if not isinstance(item, dict):
        return [f"item must be a string or an object: {item!r}"]
    errors = []
    if unknown := set(item) - ITEM_KEYS:
        errors.append(f"unknown item keys {sorted(unknown)}")
    if not any(item.get(k) for k in ("text", "pic", "draw", "color", "sound")):
        errors.append(f"item shows nothing: {item!r}")
    if item.get("sound"):
        if not re.fullmatch(r"[a-z]", item["sound"]):
            errors.append(f"sound must be one small letter: {item['sound']!r}")
        elif not (AUDIO / f"{item['sound']}.m4a").exists():
            errors.append(f"no sound file web/audio/{item['sound']}.m4a")
    if item.get("draw") and item["draw"] not in DRAWINGS:
        errors.append(f"unknown drawing {item['draw']!r}")
    if item.get("color") and item["color"] not in COLOURS:
        errors.append(f"unknown colour {item['color']!r}")
    if (item.get("pic") or item.get("draw") or item.get("color")) and not item.get("text") and not item.get("say"):
        errors.append(f"picture needs a say: {item!r}")
    return errors


def _spoken_texts(t: dict) -> list[str]:
    texts = [t[k] for k in SPOKEN if isinstance(t.get(k), str)]
    lists = [t.get(k) for k in ("options", "bank", "words")] + [p for p in _as_list(t.get("pairs")) if isinstance(p, list)]
    items = [x for xs in lists for x in _as_list(xs)]
    said = [i["say"] for i in items if isinstance(i, dict) and isinstance(i.get("say"), str)]
    # a lone small letter on a card is spoken as its sound – see itemSay() in web/js/tasks/util.js
    letters = [f"[{i}]" for i in items if isinstance(i, str) and re.fullmatch(r"[a-z]", i)]
    return texts + said + letters


def _speech_errors(t: dict) -> list[str]:
    errors = []
    for text in _spoken_texts(t):
        for letter in SOUND.findall(text):
            if not (AUDIO / f"{letter}.m4a").exists():
                errors.append(f"no sound file web/audio/{letter}.m4a for [{letter}]")
        if lone := LONE_LETTER.findall(text):
            errors.append(f"{text!r}: the voice would say the letter name of {lone} – write the sound as [x] or rephrase")
    return errors


def _silent_words(t: dict) -> list[str]:
    """Words the child would have to read: the tiles do not speak and the voice never says them.

    The player cannot read, so the word to find must be said by the voice (say / instruction –
    then the task is to recognise it among silent tiles) or the tiles must speak (speak_options).
    """
    if t.get("speak_options"):
        return []
    kind = t.get("type")
    if kind == "pick" and _is_index(t.get("answer"), t.get("options")):
        needed = [t["options"][t["answer"]]]
    elif kind == "gap_fill":
        # a picture card in the bank needs no reading
        bank = {item_label(c): c for c in t.get("bank", []) if isinstance(c, (str, dict))}
        needed = [bank.get(a[0], a[0]) for a in t.get("answers", []) if a]
    elif kind == "word_order":
        needed = t.get("words", [])
    else:  # match_pairs: every word must be known
        needed = [x for p in t.get("pairs", []) for x in p]
    words = [i if isinstance(i, str) else i.get("text") for i in needed]
    heard = f"{t.get('say', '')} {t.get('instruction', '')}".lower()
    silent = []
    for w in words:
        if not isinstance(w, str) or re.fullmatch(r"[a-z]", w):  # a lone letter speaks its sound
            continue
        if not re.search(rf"(?<![\w']){re.escape(w.lower())}(?![\w'])", heard):
            silent.append(w)
    return silent


# Words that sound the same: when the voice says one of them, the child cannot tell them apart.
HOMOPHONES = [
    {"your", "you're"}, {"its", "it's"}, {"there", "their", "they're"}, {"to", "too", "two"},
    {"for", "four"}, {"no", "know"}, {"i", "eye"}, {"be", "bee"}, {"see", "sea"},
]


def _sound_alike(t: dict) -> list[str]:
    """Other choices that sound like the word the voice asks for."""
    if not t.get("say"):
        return []
    if t.get("type") == "pick" and _is_index(t.get("answer"), t.get("options")):
        choices = [item_label(o) for o in t["options"]]
        answer = choices[t["answer"]]
    elif t.get("type") == "gap_fill" and t.get("answers") and t["answers"][0]:
        choices = [item_label(c) for c in t.get("bank", [])]
        answer = t["answers"][0][0]
    else:
        return []
    group = next((g for g in HOMOPHONES if answer.lower() in g), set())
    return [c for c in choices if c.lower() != answer.lower() and c.lower() in group]


def validate_task(t: dict) -> list[str]:
    tid = t.get("id", "?")
    errors = []

    def err(msg):
        errors.append(f"{tid}: {msg}")

    if t.get("level") not in LEVELS:
        err(f"level must be one of {LEVELS}")
    kind = t.get("type")
    if not isinstance(kind, str) or kind not in TYPES:
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
            bad = [f"option: {e}" for o in options for e in _item_errors(o)]
            for e in bad:
                err(e)
            if not _is_index(t.get("answer"), options):
                err("answer must be the index of the correct option")
            labels = [item_label(o) for o in options] if not bad else []
            if len(set(labels)) != len(labels):
                err("options must be unique")
        if not t.get("say") and not t.get("show") and "?" not in t.get("instruction", ""):
            err("nothing tells the child what to look for – add say or show")
    elif kind == "gap_fill":
        # text: "___ a boy." or a picture sentence ["It's ", "___", " ", { "pic": "🐶", "say": "dog" }, "."]
        parts = t.get("text", "")
        parts = parts if isinstance(parts, list) else [parts]
        gaps = sum(p.count("___") for p in parts if isinstance(p, str))
        for p in parts:
            if not isinstance(p, str):
                for e in _item_errors(p):
                    err(f"text: {e}")
        answers = t.get("answers")
        bank = t.get("bank")
        if gaps == 0:
            err("text has no ___ gap")
        if not isinstance(answers, list) or len(answers) != gaps or not all(_is_str_list(a) for a in answers):
            err(f"answers must be a list of {gaps} non-empty lists of strings")
        elif not isinstance(bank, list) or len(bank) < 2:
            err("bank must list at least 2 cards (the child cannot type)")
        else:
            bad = [f"bank: {e}" for c in bank for e in _item_errors(c)]
            for e in bad:
                err(e)
            if not bad:
                labels = [item_label(c) for c in bank]
                if len(set(labels)) != len(labels):
                    err("bank cards must be unique")
                missing = [a[0] for a in answers if a[0] not in labels]
                if missing:
                    err(f"bank is missing the answers {missing}")
    elif kind == "word_order":
        words = t.get("words")
        bad = []
        if not isinstance(words, list) or len(words) < 3:
            err("words must list at least 3 cards")
        else:
            bad = [f"words: {e}" for w in words for e in _item_errors(w)]
            for e in bad:
                err(e)
        if isinstance(words, list) and not bad and "accepted" in t:
            if not _is_str_list(t["accepted"]):
                err("accepted must be a list of strings")
            else:
                chips = Counter(item_label(w).lower().strip(".,!?") for w in words)
                for a in t["accepted"]:
                    if Counter(w.lower().strip(".,!?") for w in a.split()) != chips:
                        err(f"accepted variant does not use exactly the given words: {a!r}")
    elif kind == "match_pairs":
        pairs = t.get("pairs")
        if not isinstance(pairs, list) or len(pairs) < 3 or not all(isinstance(p, list) and len(p) == 2 for p in pairs):
            err("pairs must be a list of at least 3 [left, right] pairs")
        else:
            for side, name in ((0, "left"), (1, "right")):
                bad = [f"{name}: {e}" for p in pairs for e in _item_errors(p[side])]
                for e in bad:
                    err(e)
                values = [item_label(p[side]) for p in pairs] if not bad else []
                if len(set(values)) != len(values):
                    err(f"{name} items must be unique")

    # The checks below assume a well-formed task – fix the errors above first.
    if not errors:
        for e in _speech_errors(t):
            err(e)
        if alike := _sound_alike(t):
            err(f"{alike} sound(s) the same as the answer – the child cannot hear the difference")
        if silent := _silent_words(t):
            err(f"the child would have to read {silent} – add \"speak_options\": true or say the word")
    if not t.get("hint"):
        err("missing hint")
    return errors


def validate_unit(data: dict) -> list[str]:
    errors = []
    tasks = data.get("tasks")
    if not isinstance(tasks, list) or not tasks:
        return ["file has no tasks"]
    if bad := [i for i, t in enumerate(tasks) if not isinstance(t, dict)]:
        return [f"tasks at positions {bad} are not objects"]
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
