import copy
import json
from pathlib import Path

import pytest

from booksee_bucksee.validate import validate_task, validate_unit

UNIT = json.loads((Path(__file__).resolve().parents[1] / "web" / "data" / "unit01.json").read_text(encoding="utf-8"))
TASKS = {t["type"]: t for t in UNIT["tasks"]}
BROKEN = [42, -100, True, None, "", [], {}, [42], {"pic": 1}]


def task(kind, **changes):
    return {**copy.deepcopy(TASKS[kind]), **changes}


def test_unit01_is_valid():
    assert validate_unit(UNIT) == []


@pytest.mark.parametrize("answer", [True, False, -100, 99, "0", None])
def test_pick_answer_must_be_an_index(answer):
    errors = validate_task(task("pick", answer=answer))
    assert any("answer must be the index" in e for e in errors)


@pytest.mark.parametrize("kind,key", [("pick", "options"), ("gap_fill", "bank"), ("word_order", "words")])
def test_a_number_card_is_reported(kind, key):
    t = task(kind)
    t[key] = [42] + t[key][1:]
    errors = validate_task(t)
    assert any("must be a string or an object" in e for e in errors)


def test_a_number_in_a_pair_is_reported():
    t = task("match_pairs")
    t["pairs"][0] = [42, t["pairs"][0][1]]
    assert any("must be a string or an object" in e for e in validate_task(t))


@pytest.mark.parametrize("kind", sorted(TASKS))
def test_broken_fields_give_messages_not_exceptions(kind):
    keys = set(TASKS[kind]) | {"options", "bank", "words", "pairs", "answers", "text", "accepted", "answer"}
    for key in keys:
        for value in BROKEN:
            validate_task(task(kind, **{key: value}))
            if isinstance(TASKS[kind].get(key), list):
                validate_task(task(kind, **{key: [value] + TASKS[kind][key][1:]}))


def test_a_task_that_is_not_an_object_is_reported():
    assert validate_unit({"tasks": [42]}) == ["tasks at positions [0] are not objects"]
