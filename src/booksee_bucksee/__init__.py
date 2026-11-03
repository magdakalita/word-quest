"""Command line tools for the game: validate and review unit tasks, make the letter sounds."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "web" / "data"


def _load(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def cmd_validate(args) -> int:
    from .validate import validate_unit

    status = 0
    for path in args.files:
        errors = validate_unit(_load(path))
        if errors:
            status = 1
            print(f"✗ {path}")
            for e in errors:
                print(f"  - {e}")
        else:
            print(f"✓ {path}")
    return status


def cmd_review(args) -> int:
    from .review import render_review

    text = render_review(_load(args.file))
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"Saved {args.out}")
    else:
        print(text)
    return 0


def cmd_sounds(args) -> int:
    from .sounds import make_sounds

    for path in make_sounds(ROOT / "web" / "audio", args.letters or None):
        print(f"Saved {path.relative_to(ROOT)}")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(prog="booksee-bucksee", description="Tasks for The Word Quest game.")
    sub = parser.add_subparsers(required=True)

    p = sub.add_parser("validate", help="check unit files")
    p.add_argument("files", nargs="*", default=[str(f) for f in sorted(DATA.glob("unit[0-9]*.json"))])
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("review", help="print a unit as a readable list with solutions")
    p.add_argument("file")
    p.add_argument("--out", help="save to a Markdown file")
    p.set_defaults(func=cmd_review)

    p = sub.add_parser("sounds", help="make the letter sounds in web/audio/ with the macOS voice")
    p.add_argument("letters", nargs="*", help="only these letters, e.g. a c (default: all)")
    p.set_defaults(func=cmd_sounds)

    args = parser.parse_args()
    sys.exit(args.func(args))
