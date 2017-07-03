import json

for n in ["Alchemist","Armorer","Blacksmith","Carpenter","Culinarian","Goldsmith","Leatherworker","Weaver"]:
    with open(f"{n}.json", mode="rt", encoding="utf-8") as f:
        recipes = json.load(f)
    with open(f"{n}.json", mode="wt", encoding="utf-8") as f:
        json.dump(recipes, f, indent=2, sort_keys=True, ensure_ascii=False)
