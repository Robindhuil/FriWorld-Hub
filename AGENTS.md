<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Planning board

Rozrobené a odložené veci žijú na spoločnom kanbane pre všetky projekty:
**https://github.com/users/Robindhuil/projects/2**. Tento repozitár je `Projekt: FriWorld Hub`.

Ovláda sa cez `~/.claude/plan.py` (na Windows `C:/Users/robob/.claude/plan.py`), pravidlá sú
v `~/.claude/planning-board.md`.

```bash
python ~/.claude/plan.py list --projekt "FriWorld Hub"
python ~/.claude/plan.py add "Titulok" --projekt "FriWorld Hub" --typ fix --velkost S --telo "Prečo to tu je."
python ~/.claude/plan.py move "časť titulku" --stav Hotové
```

Keď sa počas práce niečo **odloží, zablokuje, alebo nájde a neopraví**, založ kartu a povedz
o tom jedným riadkom. To, čo sa v tej istej session spravilo, na board nepatrí — to je commit.
