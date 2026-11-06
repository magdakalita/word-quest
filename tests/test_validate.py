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


def test_every_door_has_three_times_as_many_tasks_to_draw_from():
    for level, groups in UNIT["plan"].items():
        tasks = [t for t in UNIT["tasks"] if t["level"] == int(level)]
        assert len(tasks) >= 3 * len(groups), f"level {level}"


def test_a_unit_without_a_plan_is_reported():
    unit = {k: v for k, v in UNIT.items() if k != "plan"}
    assert any("plan must say" in e for e in validate_unit(unit))


def test_a_group_too_small_for_its_doors_is_reported():
    unit = copy.deepcopy(UNIT)
    unit["plan"]["2"] = unit["plan"]["2"] + ["he-she"] * 2  # 4 doors, 6 tasks
    assert any("group 'he-she' has 6 tasks for 4 door(s)" in e for e in validate_unit(unit))


def test_a_task_outside_the_plan_is_reported():
    unit = copy.deepcopy(UNIT)
    unit["tasks"][0]["group"] = "nowhere"
    assert any("group 'nowhere' is not in the plan for level 1" in e for e in validate_unit(unit))


def test_a_group_with_two_kinds_of_tasks_is_reported():
    unit = copy.deepcopy(UNIT)
    pairs = next(t for t in unit["tasks"] if t["level"] == 1 and t["type"] == "match_pairs")
    pairs["group"] = "starts-with"
    assert any("group 'starts-with' mixes task types" in e for e in validate_unit(unit))


@pytest.mark.parametrize("change,message", [({"size": "huge"}, "size must be"), ({"look": "shiny"}, "look must be"), ({"in": ""}, "in needs")])
def test_a_wrong_picture_detail_is_reported(change, message):
    t = task("pick")
    t["options"] = [{"pic": "⚽", "say": "ball", **change}] + t["options"][1:]
    assert any(message in e for e in validate_task(t))


def test_a_word_outside_the_vocabulary_is_reported():
    unit = copy.deepcopy(UNIT)
    t = next(t for t in unit["tasks"] if t["id"] == "L1-20")
    t["options"][2] = {"pic": "🦆", "say": "duck"}
    t["hint"] = "Tap the pictures and listen. Like an elephant!"
    assert any("L1-20: words outside the vocabulary ['duck', 'elephant', 'like']" in e for e in validate_unit(unit))


def test_a_unit_without_a_vocabulary_is_reported():
    unit = {k: v for k, v in UNIT.items() if k != "vocabulary"}
    assert any("vocabulary must list" in e for e in validate_unit(unit))
