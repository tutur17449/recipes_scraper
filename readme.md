# Scraper

## Info

Node.js scraper to get recipes on differents others websites with license CC BY 3.0 and CC BY-SA 3.0.
The scraper works as follows

1. Request target url
2. Parse data
3. Translate data
4. Download recipe image
5. Put json data on json file and save

IT'S NOT INTENDED TO BE AUTOMATED !!!

## Targets

- https://www.foodista.com/ (OK)

```
"creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
"license": "CC BY 3.0",
"sourceName": "Foodista",
```

- https://pickfreshfoods.com/ (OK)

```
"creditsText": "Pick Fresh Foods",
"license": "CC BY 3.0",
"sourceName": "Pick Fresh Foods",
```

- https://cuisine-saine.fr/ (OK)

```
"creditsText": "Karen Chevalier Cuisine Saine",
"license": "CC BY-NC 4.0",
"sourceName": "Cuisine Saine",
```

- https://fullbellysisters.blogspot.com/ (KO)

```
"creditsText": "Full Belly Sisters",
"license": "CC BY-SA 3.0",
"sourceName": "Full Belly Sisters",
```

## Running

Spot recipes and grab url on urlList<Target>.json

Manually, with

```
node scrap<Target>.js
```
