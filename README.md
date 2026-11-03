# The Word Quest

Angielska wersja gry [Die Wortqueste](https://github.com/magdakalita/wortqueste) dla dzieci, które jeszcze nie czytają. Ta sama platformówka: dziecko wybiera czarodzieja i biega po magicznym zamku – zaczarowane drzwi otwierają się dopiero po rozwiązaniu zadania, latające księgi zaklęć dają zadania bonusowe, a na końcu wieży sfinks zadaje pytania.

- wszystkie polecenia, podpowiedzi i pochwały są czytane na głos (głos wbudowany w przeglądarkę), przycisk 🔊 powtarza polecenie
- odpowiada się wyłącznie stuknięciem – bez klawiatury
- 4 poziomy: litery a, b, c, d → małe słowa (I, you, he, she, my, your, am, it's, I'm, you're) → kolory, zabawki i rodzina → zdania („It's a blue box.”)
- 4 typy zadań: posłuchaj i stuknij (`pick`), dopasuj pary, uzupełnij lukę z banku słów, ułóż zdanie
- zła odpowiedź = podpowiedź i druga próba, potem rozwiązanie (bez „game over” za błędy językowe)
- postęp zapisuje się w przeglądarce

Gra to statyczna strona (`web/`) – bez serwera i bez kosztów. Python (`src/booksee_bucksee/`) służy tylko do sprawdzania zadań.

## Granie lokalnie

```sh
python3 -m http.server -d web 8000
```

Potem otwórz <http://localhost:8000> w Chrome lub Safari. Dodaj `?all` do adresu (<http://localhost:8000/?all>), żeby odblokować wszystkie poziomy – przydatne do sprawdzania.

Głos: gra wybiera angielski głos systemu (np. „Samantha” na Macu/iPadzie, „Google UK English Female” w Chrome). Przycisk ♪ wycisza dźwięki i głos.

## Przegląd zadań

Lista wszystkich zadań z rozwiązaniami:

```sh
uv run booksee-bucksee review web/data/unit01.json --out zadania_unit01.md
```

Zadania można poprawiać bezpośrednio w `web/data/unit01.json`. Po zmianach sprawdź plik:

```sh
uv run booksee-bucksee validate
```

### Format zadań

Karta (opcja, element pary, obrazek `show`) to słowo/litera (`"she"`), obrazek emoji (`{ "pic": "🐶", "say": "dog" }`) albo rysunek w kolorze (`{ "draw": "box", "color": "blue" }` – rysunki: `blob`, `box`, `ball`, `cupcake`, kolory w `web/js/pics.js`).

- `say` – co mówi głos po poleceniu (np. słowo, które trzeba znaleźć)
- `show` – duży obrazek lub litera nad zadaniem
- `speak_options: true` – stuknięcie obrazka mówi jego nazwę (do zadań „Which one starts with c?”). Nie włączaj tego, gdy dziecko ma rozpoznać słowo – głos zdradziłby odpowiedź.

## Nowy unit

1. Dopisz plik `web/data/unit02.json` (ten sam format, 6–14 zadań na poziom; ostatnie 2 zadania poziomu 4 zadaje sfinks).
2. Dopisz unit do menu w `web/data/units.json`.
3. Uruchom `uv run booksee-bucksee validate`.

## Publikacja (GitHub Pages)

Repozytorium zawiera workflow `.github/workflows/pages.yml`, który publikuje folder `web/` przy każdym pushu na `main`.

1. Utwórz repozytorium na GitHubie i wypchnij kod.
2. W repozytorium: Settings → Pages → Source: **GitHub Actions**.
3. Po kilku minutach gra jest dostępna pod adresem `https://<użytkownik>.github.io/<repozytorium>/`.

## Struktura

```
web/                   gra (publikowana)
  js/engine/           silnik: fizyka, kolizje, sterowanie, dźwięki
  js/levels/           budowanie plansz z gotowych fragmentów
  js/tasks/            okno zadania i 4 typy zadań
  js/speech.js         czytanie na głos (Web Speech API)
  js/pics.js           kolorowe rysunki (pudełko, piłka, babeczka)
  js/sprites.js        grafika pixel art rysowana w kodzie
  data/                zadania (unitNN.json) i lista unitów
src/booksee_bucksee/   narzędzia: validate, review
```
