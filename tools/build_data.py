"""Builds menu-data.js for the Lavender Lounge site from their live menu export.
Source: menu.omegasoftware.ca/lavenderlounge (saved as tools/live-menu.json).
Run from the project folder:  python tools/build_data.py
Prices are in US dollars, exactly as on the live menu. Item IDs are the live menu's IDs."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
live = json.load(open(os.path.join(ROOT, 'tools', 'live-menu.json'), encoding='utf-8'))
ITEM = {i['ID']: i for c in live['menu'] for g in c['groups'] for i in g['items']}
used = set()

def p(i):                     # price of a live item, and mark it used
    used.add(i); return ITEM[i]['PRICE']

def item(i, name=None, note=None, **kw):
    d = {'id': str(i), 'n': name or ITEM[i]['ITEMNAME'], 'p': p(i)}
    if note: d['note'] = note
    d.update(kw)
    return d

def variants(key, name, opts, note=None, **kw):
    """opts: [(label, live_id), ...] -> one dish with size/variant choice"""
    v = [[lab, p(i), str(i)] for lab, i in opts]
    d = {'id': key, 'n': name, 'p': min(x[1] for x in v), 'v': v}
    if note: d['note'] = note
    d.update(kw)
    return d

SIG = {'sig': 1}   # house signature flag

SECTIONS = [
  # ---------------- DAYLIGHT ----------------
  dict(id='hot', mood='day', title='Hot Beverages', kicker='Slow mornings', photo='hot', groups=[dict(items=[
    item(100, 'Espresso'), item(101, 'Doppio', 'Double espresso'), item(103, 'Americano'), item(102, 'Cappuccino'),
    item(104, 'Hot Chocolate'), item(107, 'Rakwa', 'Lebanese coffee, served in a rakwa'), item(108, 'Decaf Coffee'),
    item(105, 'Tea'), item(106, 'Tea Selection', 'Ask for today’s teas'),
    item(109, 'Nescafé', pick=['How do you take it?', ['With milk', 'With Coffee-mate'], 1]),
  ])]),
  dict(id='latte', mood='day', title='Lattes', kicker='Velvet & foam', photo='latte', groups=[dict(items=[
    item(63, 'Coffee Latte'), item(64), item(65), item(66), item(67), item(68),
  ])]),
  dict(id='iced', mood='day', title='Iced Lattes', kicker='Poured over ice', photo='iced', groups=[dict(items=[
    item(69), item(70), item(71), item(72), item(73),
  ])]),
  dict(id='frappe', mood='day', title='Frappés', kicker='Blended & cold', photo='frappe', groups=[dict(items=[
    item(51, 'Mocha Frappé'), item(52, 'Caramel Frappé'), item(53, 'White Mocha Frappé'), item(54, 'Tiramisu Frappé'), item(55, 'Vanilla Frappé'),
  ])]),
  dict(id='shakes', mood='day', title='Milkshakes', kicker='Thick, cold, happy', photo='shakes', groups=[dict(items=[
    item(80, 'Lavender Milkshake', 'The house favourite', **SIG), item(81, 'Pistachio Milkshake'), item(77, 'Lotus Milkshake'),
    item(76, 'Oreo Milkshake'), item(75, 'Caramel Milkshake'), item(196, 'Chocolate Milkshake'), item(74, 'Strawberry Milkshake'),
    item(79, 'Blueberry Milkshake'), item(78, 'Vanilla Milkshake'),
  ])]),
  dict(id='smoothies', mood='day', title='Smoothies', kicker='Fruit, only fruit', photo='smoothies', groups=[dict(items=[
    item(82), item(83), item(86), item(85), item(84),
  ])]),
  dict(id='mocktails', mood='day', title='Mocktails & Juices', kicker='Fresh-pressed', photo='mocktails', groups=[dict(items=[
    item(165, 'Vana Sunset', 'House mocktail', **SIG), item(56), item(57), item(58), item(59, 'Mint Lemonade'),
    item(60), item(61), item(62),
  ])]),
  dict(id='refreshers', mood='day', title='Refreshers', kicker='Iced tea & virgin mojitos', photo='refreshers', groups=[dict(items=[
    item(93, 'Iced Tea Peach'), item(94, 'Iced Tea Mango'), item(95, 'Mint Mojito'), item(96), item(97), item(98), item(99),
  ])]),
  dict(id='cold', mood='day', title='Cold Beverages', kicker='Straight from the fridge', photo='cold', groups=[
    dict(title='Water & soft drinks', items=[
      variants('water', 'Water', [('Small', 112), ('Large', 113)]), item(114),
      variants('soft', 'Soft Drink', [('Pepsi', 172), ('Diet Pepsi', 173), ('7up', 170), ('Diet 7up', 171), ('Mirinda', 174), ('Diet Mirinda', 175)]),
      item(225), ]),
    dict(title='Energy', items=[item(121, 'Red Bull'), item(119, 'XXL'), item(120, 'Boom Boom')]),
    dict(title='Beer', items=[item(117, 'Almaza'), item(116, 'Almaza Light'), item(118, 'Mexican')]),
  ]),
  # ---------------- AFTER DARK ----------------
  dict(id='cocktails', mood='night', title='Cocktails', kicker='Shaken after sunset', photo='cocktails', groups=[dict(items=[
    item(91, 'Lavender Martini', 'Our namesake', **SIG), item(87, 'Gin Basil'), item(88, 'Margarita'), item(90, 'Blueberry Margarita'),
    item(89, 'Passion Fruit Martini'), item(92, 'Jäger Bomb'),
  ])]),
  dict(id='whisky', mood='night', title='Whisky', kicker='By the glass or the bottle', photo='whisky', groups=[dict(items=[
    variants('redlabel', 'Johnnie Walker Red Label', [('Glass', 122), ('Bottle 37cl', 228), ('Bottle 75cl', 127)]),
    variants('blacklabel', 'Johnnie Walker Black Label', [('Glass', 123), ('Bottle 37cl', 229), ('Bottle 75cl', 128)]),
    variants('jameson', 'Jameson', [('Glass', 124), ('Bottle 70cl', 129)]),
    variants('chivas', 'Chivas Regal', [('Glass', 126), ('Bottle 70cl', 130)]),
    variants('glenfiddich', 'Glenfiddich', [('Glass', 125), ('Bottle 70cl', 131)]),
  ])]),
  dict(id='vodka', mood='night', title='Vodka', kicker='Ice cold', glyph='glass', groups=[dict(items=[
    variants('russtd', 'Russian Standard', [('Glass', 132), ('Bottle 70cl', 139)]),
    item(133, 'Russian Standard Gold', 'Glass'),
    variants('stoli', 'Stolichnaya', [('Glass', 134), ('Bottle 70cl', 138)]),
    item(135, 'Stoli Elit', 'Glass'), item(136, 'Belvedere', 'Glass'), item(137, 'Grey Goose', 'Glass'),
  ])]),
  dict(id='gin', mood='night', title='Gin', kicker='Botanical', glyph='glass', groups=[dict(items=[
    variants('gordons', 'Gordon’s', [('Glass', 140), ('Bottle', 142)]), item(141, 'Bombay Sapphire', 'Glass'),
  ])]),
  dict(id='wine', mood='night', title='Wine', kicker='From Lebanese valleys', glyph='wine', groups=[
    dict(title='By the glass', items=[variants('wineglass', 'House Wine', [('Red', 146), ('White', 147), ('Rosé', 148)], 'Glass')]),
    dict(title='By the bottle · 75cl', items=[
      item(152, 'Ksara Réserve du Couvent', 'Red'), item(154, 'Ksara Blanc de Blancs', 'White'), item(153, 'Ksara Rosé', 'Rosé'),
      item(155, 'Kefraya', 'Red'), item(158, 'Kefraya Blanc de Blancs', 'White'),
      item(149, 'Warde', 'Red'), item(150, 'Warde', 'White'), item(151, 'Warde', 'Rosé'),
      variants('sunset', 'Sunset Rosé', [('75cl', 156), ('150cl magnum', 157)]),
    ]),
  ]),
  dict(id='shots', mood='night', title='Shots', kicker='One for the table', glyph='shot', groups=[dict(items=[
    item(143, 'Jägermeister'), item(144, 'Tequila'), item(145, 'Baileys'),
  ])]),
  # ---------------- SMOKE ----------------
  dict(id='shisha', mood='smoke', title='Shisha', kicker='Light it slow', glyph='shisha', groups=[dict(items=[
    item(159, 'Lemon & Mint', 'Hamod w Na3na3', a=[['Extra head', 3, 3]]),
    item(160, 'Double Apple', 'Teffehten', a=[['Extra head', 3, 3]]),
    item(162, 'Ajami', 'The classic Lebanese tobacco', a=[['Extra head', 5, 3]]),
    item(166, 'House Flavors', 'Grape, mint, grape & mint, blueberry or Love', pick=['Choose your flavor', ['Grape (3enab)', 'Mint (Na3na3)', 'Grape & Mint', 'Blueberry', 'Love'], 1], a=[['Extra head', 3, 3]]),
    item(169, 'Extra Hose'),
  ])]),
  dict(id='cigars', mood='smoke', title='Cigars', kicker='Ask for the humidor', glyph='cigar', groups=[dict(items=[
    item(198, 'Cigar Selection', 'Ask your server for today’s selection'),
  ])]),
  # ---------------- SWEET ----------------
  dict(id='dessert', mood='sweet', title='Desserts', kicker='Something sweet', glyph='cake', groups=[
    dict(title='Cakes', items=[
      item(176, 'Fondant au Chocolat', 'Warm, with a scoop of ice cream', **SIG), item(179, 'Brownies', 'With a scoop of ice cream'),
      item(178, 'Chocolate Biscuit Cake'), item(180, 'Strawberry Cheesecake')]),
    dict(title='Ice cream', items=[item(177, 'Ice Cream Cup', '3 scoops', a=[['Extra scoop', 2, 5]])]),
  ]),
]
missing = set(ITEM) - used - {115}   # 115 = generic "Soft Drinks", replaced by the Soft Drink chooser
assert not missing, sorted((i, ITEM[i]['ITEMNAME']) for i in missing)

b = live['branch']
INFO = {'name': 'Lavender Lounge', 'street': b['STREET'], 'city': b['CITY'], 'phone': b['PHONE2'], 'phone2': b['PHONE1'],
        'lat': b['LAT'], 'lng': b['LNG'], 'instagram': 'https://www.instagram.com/lavenderlounge.leb', 'rate': 90000}
js = ('/* Lavender Lounge menu, generated by tools/build_data.py from their live menu (menu.omegasoftware.ca/lavenderlounge).\n'
      '   Prices in US dollars. ids = live menu item IDs (variants keep each source ID). */\n'
      'window.LL_INFO = ' + json.dumps(INFO, ensure_ascii=False) + ';\n'
      'window.LL_MENU = ' + json.dumps(SECTIONS, ensure_ascii=False, separators=(',', ':')).replace('},{"id"', '},\n{"id"') + ';\n')
open(os.path.join(ROOT, 'menu-data.js'), 'w', encoding='utf-8').write(js)
n = sum(len(g['items']) for s in SECTIONS for g in s['groups'])
print('sections', len(SECTIONS), '| dishes', n, '| live items covered', len(used), 'of', len(ITEM))
