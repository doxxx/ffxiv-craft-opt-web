from __future__ import print_function
import sqlite3
import json
import itertools
import operator

conn = sqlite3.connect('app_data.sqlite')

classes = {key: name for (key, name) in conn.execute('select Key, Name_en from ClassJob')}
craftTypes = {key: classJob for (key, classJob) in conn.execute('select Key, ClassJob from CraftType')}
itemNames = {key: name for (key, name) in conn.execute('select Key, UIName_en from Item')}

def makeRecipe(craftType, itemId, level, data):
    data = json.loads(data)
    r = {
        'cls': classes[craftTypes[craftType]],
        'name': itemNames[itemId],
        'level': int(level),
        'durability': int(data['material_point']),
        'difficulty': int(data['work_max']),
        'maxQuality': int(data['quality_max'])
    }
    return r

recipes = [makeRecipe(craftType, itemId, level, data)
           for (craftType, itemId, level, data)
           in conn.execute('select CraftType, CraftItemId, Level, data from Recipe')]

recipeClassName = operator.itemgetter('cls')
recipes.sort(key=recipeClassName)
recipesByClass = {k:list(v) for k,v in itertools.groupby(recipes, recipeClassName)}
recipeLevel = operator.itemgetter('level')
for cls in recipesByClass:
    clsRecipes = recipesByClass[cls]
    clsRecipes.sort(key=recipeLevel)
    for recipe in clsRecipes:
        del recipe['cls']

recipeDbFile = open('recipedb.js', 'w')
try:
    recipeDbFile.write('FFXIV_Recipe_DB = ')
    json.dump(recipesByClass, recipeDbFile)
finally:
    recipeDbFile.close()
